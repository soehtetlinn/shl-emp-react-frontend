import { beforeEach, describe, expect, it } from "vitest";
import { decodeJwt } from "../../auth/jwt.js";
import { unwrapDynamo } from "../dynamo.js";
import { mockRequest, resetMockDb } from "./server.js";

async function signIn(email, password) {
  const token = await mockRequest({ method: "POST", path: "/api/login", body: { email, password } });
  return (method, path, body) => mockRequest({ method, path, body, token });
}

beforeEach(resetMockDb);

describe("login", () => {
  it("returns a token carrying the account level", async () => {
    const token = await mockRequest({
      method: "POST",
      path: "/api/login",
      body: { email: "hr@gmail.com", password: "hr" },
    });
    expect(decodeJwt(token)).toMatchObject({ _id: "emp-hr", Account: 2 });
  });

  it("rejects wrong credentials and missing tokens with 401", async () => {
    await expect(
      mockRequest({ method: "POST", path: "/api/login", body: { email: "hr@gmail.com", password: "nope" } }),
    ).rejects.toMatchObject({ status: 401 });
    await expect(mockRequest({ method: "GET", path: "/api/role" })).rejects.toMatchObject({ status: 401 });
  });
});

describe("collections", () => {
  it("lists rows with their relations populated", async () => {
    const hr = await signIn("hr@gmail.com", "hr");
    const cities = await hr("GET", "/api/city");
    const yangon = cities.find((city) => city.CityName === "Yangon");
    expect(yangon.state[0].country[0].CountryName).toBe("Myanmar");
  });

  it("creates, updates and deletes", async () => {
    const hr = await signIn("hr@gmail.com", "hr");
    const created = await hr("POST", "/api/country", { CountryName: "Japan", ignored: true });
    expect(created).not.toHaveProperty("ignored");
    await hr("PUT", `/api/country/${created._id}`, { CountryName: "Nippon" });
    expect((await hr("GET", "/api/country")).map((c) => c.CountryName)).toContain("Nippon");
    await hr("DELETE", `/api/country/${created._id}`);
    expect(await hr("GET", "/api/country")).toHaveLength(3);
  });

  it("refuses to delete a record that is still referenced", async () => {
    const hr = await signIn("hr@gmail.com", "hr");
    await expect(hr("DELETE", "/api/country/cty-mm")).rejects.toMatchObject({ status: 403 });
  });

  it("updates a portal by its numeric ID", async () => {
    const admin = await signIn("admin@gmail.com", "admin");
    await admin("PUT", "/api/admin/portal/5", { PortalName: "Guru", Status: 1 });
    const portals = await admin("GET", "/api/admin/portal");
    expect(portals.find((p) => p._id === "pt-5").Status).toBe(1);
  });
});

describe("permissions", () => {
  it("keeps admin routes for admins", async () => {
    const hr = await signIn("hr@gmail.com", "hr");
    await expect(hr("GET", "/api/admin/portal")).rejects.toMatchObject({ status: 403 });
  });

  it("limits an employee to their own records", async () => {
    const employee = await signIn("emp@gmail.com", "emp");
    expect((await employee("GET", "/api/education/emp-emp")).education).toHaveLength(2);
    expect((await employee("GET", "/api/salary/emp-emp")).salary).toHaveLength(1);
    await expect(employee("GET", "/api/salary/emp-004")).rejects.toMatchObject({ status: 403 });
    await expect(employee("GET", "/api/education/emp-004")).rejects.toMatchObject({ status: 403 });
    await expect(employee("GET", "/api/employee")).rejects.toMatchObject({ status: 403 });
  });
});

describe("employees and salaries", () => {
  it("never returns passwords", async () => {
    const hr = await signIn("hr@gmail.com", "hr");
    const employees = await hr("GET", "/api/employee");
    expect(employees.every((e) => !("Password" in e))).toBe(true);
    expect(employees[0].department[0].DepartmentName).toBeTruthy();
  });

  it("allows one salary per employee", async () => {
    const hr = await signIn("hr@gmail.com", "hr");
    const salary = { BasicSalary: 1, BankName: "B", AccountNo: "1", AccountHolderName: "M", IFSCcode: "X", TaxDeduction: 0 };
    await hr("POST", "/api/salary/emp-023", salary);
    expect(await hr("GET", "/api/salary")).toHaveLength(22);
    await expect(hr("POST", "/api/salary/emp-023", salary)).rejects.toMatchObject({ status: 403 });
  });

  it("lets HR change the status of a leave application", async () => {
    const hr = await signIn("hr@gmail.com", "hr");
    await hr("PUT", "/api/leave-application-hr/lv-1", { Status: 2, Leavetype: "changed" });
    const leave = (await hr("GET", "/api/leave-application-hr")).find((l) => l._id === "lv-1");
    expect(leave).toMatchObject({ Status: 2, Leavetype: "Casual Leave" });
    expect(leave.employee[0].EmployeeCode).toBe("EMP-003");
  });
});

describe("unwrapDynamo", () => {
  it("flattens a DynamoDB envelope and leaves plain data alone", () => {
    const envelope = { statusCode: 200, body: { message: [{ FirstName: { S: "A" }, Age: { N: "27" } }] } };
    expect(unwrapDynamo(envelope)).toEqual([{ FirstName: "A", Age: 27 }]);
    expect(unwrapDynamo([{ a: 1 }])).toEqual([{ a: 1 }]);
    expect(unwrapDynamo("token")).toBe("token");
  });
});
