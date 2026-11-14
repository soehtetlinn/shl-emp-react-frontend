// Starting data for the in-browser backend. Every person and company here is made up.

export const DEMO_ACCOUNTS = [
  { label: "Admin", description: "Master data and project bids", email: "admin@gmail.com", password: "admin" },
  { label: "HR", description: "People, salaries and leave", email: "hr@gmail.com", password: "hr" },
  { label: "Employee", description: "Own profile and leave", email: "emp@gmail.com", password: "emp" },
];

/** A YYYY-MM-DD date relative to today, so leave requests always look current. */
function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const countries = [
  { _id: "cty-mm", CountryName: "Myanmar" },
  { _id: "cty-th", CountryName: "Thailand" },
  { _id: "cty-sg", CountryName: "Singapore" },
];

const states = [
  { _id: "st-ygn", CountryID: "cty-mm", StateName: "Yangon Region" },
  { _id: "st-mdy", CountryID: "cty-mm", StateName: "Mandalay Region" },
  { _id: "st-mon", CountryID: "cty-mm", StateName: "Mon State" },
  { _id: "st-bkk", CountryID: "cty-th", StateName: "Bangkok" },
  { _id: "st-cnx", CountryID: "cty-th", StateName: "Chiang Mai" },
  { _id: "st-sg", CountryID: "cty-sg", StateName: "Central Region" },
];

const cities = [
  { _id: "ci-ygn", StateID: "st-ygn", CityName: "Yangon" },
  { _id: "ci-mdy", StateID: "st-mdy", CityName: "Mandalay" },
  { _id: "ci-tht", StateID: "st-mon", CityName: "Thaton" },
  { _id: "ci-mlm", StateID: "st-mon", CityName: "Mawlamyine" },
  { _id: "ci-bkk", StateID: "st-bkk", CityName: "Bangkok" },
  { _id: "ci-cnx", StateID: "st-cnx", CityName: "Chiang Mai" },
  { _id: "ci-sg", StateID: "st-sg", CityName: "Singapore" },
];

const companies = [
  {
    _id: "co-shl",
    CompanyName: "SHL Technology",
    Address: "No. 12, Example Street",
    CityID: "ci-ygn",
    PostalCode: "11181",
    Website: "https://shl.example.com",
    Email: "contact@shl.example.com",
    ContactPerson: "Aung Min",
    ContactNo: "09-000-000-001",
    FaxNo: "01-000-001",
    PanNo: "PAN-0001",
    GSTNo: "GST-0001",
    CINNo: "CIN-0001",
  },
  {
    _id: "co-nova",
    CompanyName: "Nova Automation",
    Address: "88 Sample Road",
    CityID: "ci-bkk",
    PostalCode: "10110",
    Website: "https://nova.example.com",
    Email: "hello@nova.example.com",
    ContactPerson: "Somchai P.",
    ContactNo: "02-000-0002",
    FaxNo: "02-000-0003",
    PanNo: "PAN-0002",
    GSTNo: "GST-0002",
    CINNo: "CIN-0002",
  },
  {
    _id: "co-lotus",
    CompanyName: "Lotus Print Works",
    Address: "5 Demo Avenue",
    CityID: "ci-mdy",
    PostalCode: "05011",
    Website: "https://lotus.example.com",
    Email: "info@lotus.example.com",
    ContactPerson: "Daw Khin",
    ContactNo: "09-000-000-050",
    FaxNo: "",
    PanNo: "PAN-0003",
    GSTNo: "GST-0003",
    CINNo: "CIN-0003",
  },
];

const roles = [
  { _id: "ro-admin", CompanyID: "co-shl", RoleName: "Administrator" },
  { _id: "ro-hr", CompanyID: "co-shl", RoleName: "HR Manager" },
  { _id: "ro-lead", CompanyID: "co-shl", RoleName: "Team Lead" },
  { _id: "ro-eng", CompanyID: "co-shl", RoleName: "Engineer" },
  { _id: "ro-staff", CompanyID: "co-shl", RoleName: "Staff" },
];

const positions = [
  { _id: "po-cto", CompanyID: "co-shl", PositionName: "CTO", salary: 4200000 },
  { _id: "po-hr", CompanyID: "co-shl", PositionName: "HR Lead", salary: 2100000 },
  { _id: "po-sse", CompanyID: "co-shl", PositionName: "Senior Software Engineer", salary: 2600000 },
  { _id: "po-se", CompanyID: "co-shl", PositionName: "Software Engineer", salary: 1500000 },
  { _id: "po-qa", CompanyID: "co-shl", PositionName: "QA Analyst", salary: 1200000 },
  { _id: "po-ux", CompanyID: "co-shl", PositionName: "UI/UX Designer", salary: 1400000 },
  { _id: "po-sales", CompanyID: "co-shl", PositionName: "Sales Executive", salary: 1100000 },
  { _id: "po-acc", CompanyID: "co-shl", PositionName: "Accountant", salary: 1300000 },
  { _id: "po-ops", CompanyID: "co-shl", PositionName: "Operations Officer", salary: 1000000 },
];

const departments = [
  { _id: "de-mgmt", CompanyID: "co-shl", DepartmentName: "Management" },
  { _id: "de-hr", CompanyID: "co-shl", DepartmentName: "Human Resources" },
  { _id: "de-tech", CompanyID: "co-shl", DepartmentName: "Technology" },
  { _id: "de-design", CompanyID: "co-shl", DepartmentName: "Design" },
  { _id: "de-sales", CompanyID: "co-shl", DepartmentName: "Sales" },
  { _id: "de-fin", CompanyID: "co-shl", DepartmentName: "Finance" },
  { _id: "de-ops", CompanyID: "co-shl", DepartmentName: "Operations" },
];

// [first, middle, last, gender, department, position, role, date of birth, date of joining]
const STAFF = [
  ["May", "", "Thu", "female", "de-tech", "po-se", "ro-eng", "1998-04-18", "2023-02-13"],
  ["Zaw", "Lin", "Oo", "male", "de-tech", "po-sse", "ro-lead", "1990-07-02", "2019-05-20"],
  ["Hnin", "", "Wai", "female", "de-tech", "po-se", "ro-eng", "1997-01-25", "2022-08-01"],
  ["Min", "Khant", "Zaw", "male", "de-tech", "po-se", "ro-eng", "1999-10-11", "2024-01-15"],
  ["Su", "Myat", "Noe", "female", "de-tech", "po-qa", "ro-eng", "1996-06-30", "2021-11-08"],
  ["Thant", "", "Zin", "male", "de-tech", "po-qa", "ro-eng", "1995-03-09", "2020-09-14"],
  ["Ei", "Phyu", "Sin", "female", "de-design", "po-ux", "ro-staff", "1997-12-21", "2022-03-07"],
  ["Nay", "", "Lin", "male", "de-design", "po-ux", "ro-lead", "1992-05-16", "2019-10-01"],
  ["Khin", "", "Yadanar", "female", "de-sales", "po-sales", "ro-staff", "1994-09-03", "2021-04-19"],
  ["Ye", "", "Yint", "male", "de-sales", "po-sales", "ro-staff", "1993-11-27", "2020-02-10"],
  ["Thuzar", "", "Aye", "female", "de-sales", "po-sales", "ro-lead", "1989-08-14", "2018-06-04"],
  ["Pyae", "Sone", "Aung", "male", "de-fin", "po-acc", "ro-staff", "1991-02-19", "2019-12-02"],
  ["Nandar", "", "Hlaing", "female", "de-fin", "po-acc", "ro-staff", "1996-04-05", "2023-07-17"],
  ["Htet", "", "Naing", "male", "de-ops", "po-ops", "ro-staff", "1998-08-23", "2024-05-06"],
  ["Wai", "Yan", "Phyo", "male", "de-ops", "po-ops", "ro-staff", "1994-01-12", "2021-01-25"],
  ["Shwe", "", "Sin", "female", "de-ops", "po-ops", "ro-lead", "1990-10-29", "2018-11-12"],
  ["Kaung", "", "Myat", "male", "de-tech", "po-sse", "ro-eng", "1992-12-07", "2020-07-06"],
  ["Yoon", "", "Mhi", "female", "de-hr", "po-hr", "ro-staff", "1995-05-31", "2022-10-03"],
  ["Sai", "", "Kham", "male", "de-tech", "po-se", "ro-eng", "2000-03-15", "2025-03-10"],
  ["Chaw", "Su", "Hlaing", "female", "de-design", "po-ux", "ro-staff", "1999-07-08", "2025-06-16"],
];

const demoPeople = [
  {
    _id: "emp-admin",
    Email: "admin@gmail.com",
    Password: "admin",
    Account: 1,
    RoleID: "ro-admin",
    Gender: "male",
    FirstName: "Aung",
    MiddleName: "",
    LastName: "Min",
    DOB: "1988-03-14",
    ContactNo: "09-000-000-001",
    EmployeeCode: "EMP-001",
    DepartmentID: "de-mgmt",
    PositionID: "po-cto",
    DateOfJoining: "2018-01-08",
    TerminateDate: "",
  },
  {
    _id: "emp-hr",
    Email: "hr@gmail.com",
    Password: "hr",
    Account: 2,
    RoleID: "ro-hr",
    Gender: "female",
    FirstName: "Thiri",
    MiddleName: "",
    LastName: "Win",
    DOB: "1991-08-22",
    ContactNo: "09-000-000-002",
    EmployeeCode: "EMP-002",
    DepartmentID: "de-hr",
    PositionID: "po-hr",
    DateOfJoining: "2019-06-03",
    TerminateDate: "",
  },
  {
    _id: "emp-emp",
    Email: "emp@gmail.com",
    Password: "emp",
    Account: 3,
    RoleID: "ro-eng",
    Gender: "male",
    FirstName: "Kyaw",
    MiddleName: "Zin",
    LastName: "Htun",
    DOB: "1996-12-05",
    ContactNo: "09-000-000-003",
    EmployeeCode: "EMP-003",
    DepartmentID: "de-tech",
    PositionID: "po-se",
    DateOfJoining: "2022-11-01",
    TerminateDate: "",
    EmergencyContactNo: "09-000-000-099",
    PANcardNo: "PAN-EMP-003",
    BloodGroup: "O+",
    Hobbies: "Football, reading",
    PresentAddress: "Room 4B, Example Condo, Yangon",
    PermanetAddress: "Example Quarter, Thaton",
  },
];

const staff = STAFF.map(([first, middle, last, gender, department, position, role, dob, joined], index) => {
  const number = index + 4;
  return {
    _id: `emp-${String(number).padStart(3, "0")}`,
    Email: `${first}.${last}`.toLowerCase() + "@shl.example.com",
    Password: "demo",
    Account: 3,
    RoleID: role,
    Gender: gender,
    FirstName: first,
    MiddleName: middle,
    LastName: last,
    DOB: dob,
    ContactNo: `09-000-000-${String(number).padStart(3, "0")}`,
    EmployeeCode: `EMP-${String(number).padStart(3, "0")}`,
    DepartmentID: department,
    PositionID: position,
    DateOfJoining: joined,
    TerminateDate: "",
  };
});

const employees = [...demoPeople, ...staff];

const fullName = (e) => [e.FirstName, e.MiddleName, e.LastName].filter(Boolean).join(" ");

// Everyone but the two newest hires has salary details on file.
const salaries = employees.slice(0, -2).map((employee, index) => {
  const basic = positions.find((p) => p._id === employee.PositionID).salary;
  return {
    _id: `sal-${index + 1}`,
    EmployeeID: employee._id,
    BasicSalary: basic,
    BankName: index % 3 === 0 ? "Example Bank" : index % 3 === 1 ? "Sample Savings Bank" : "Demo Commercial Bank",
    AccountNo: String(1000200030 + index * 7919),
    AccountHolderName: fullName(employee),
    IFSCcode: `EXB000${(index % 4) + 1}`,
    TaxDeduction: Math.round(basic * 0.05),
  };
});

const leave = (id, employeeId, type, from, to, reason, status) => ({
  _id: id,
  EmployeeID: employeeId,
  Leavetype: type,
  FromDate: daysFromNow(from),
  ToDate: daysFromNow(to),
  Reasonforleave: reason,
  Status: status,
});

const leaves = [
  leave("lv-1", "emp-emp", "Casual Leave", 9, 10, "Family event in Thaton", 1),
  leave("lv-2", "emp-emp", "Sick Leave", -40, -39, "Fever", 2),
  leave("lv-3", "emp-emp", "Privilege Leave", -120, -116, "Annual trip", 2),
  leave("lv-4", "emp-emp", "Casual Leave", -75, -75, "Personal errand", 3),
  leave("lv-5", "emp-004", "Sick Leave", 2, 3, "Dental surgery", 1),
  leave("lv-6", "emp-005", "Privilege Leave", 14, 18, "Wedding in Mandalay", 1),
  leave("lv-7", "emp-009", "Casual Leave", 5, 5, "Moving house", 1),
  leave("lv-8", "emp-012", "Casual Leave", 21, 22, "Family visit", 1),
  leave("lv-9", "emp-007", "Sick Leave", -12, -10, "Flu", 2),
  leave("lv-10", "emp-010", "Privilege Leave", -30, -24, "Holiday", 2),
  leave("lv-11", "emp-014", "Casual Leave", -18, -18, "Bank appointment", 2),
  leave("lv-12", "emp-016", "Casual Leave", -8, -6, "Short notice request", 3),
  leave("lv-13", "emp-018", "Sick Leave", -3, -2, "Migraine", 2),
  leave("lv-14", "emp-020", "Privilege Leave", 30, 36, "Overseas travel", 1),
];

const portals = [
  { _id: "pt-1", ID: 1, PortalName: "Upwork", Status: 1 },
  { _id: "pt-2", ID: 2, PortalName: "Freelancer", Status: 1 },
  { _id: "pt-3", ID: 3, PortalName: "Toptal", Status: 1 },
  { _id: "pt-4", ID: 4, PortalName: "Direct referral", Status: 1 },
  { _id: "pt-5", ID: 5, PortalName: "Guru", Status: 0 },
];

// [title, portal, hours, cost, resource, status, remark]
const BIDS = [
  ["Inventory dashboard", "pt-1", 120, 4500, 1, 1, "Waiting for client reply"],
  ["Clinic booking app", "pt-2", 200, 8000, 2, 4, "Awarded, kickoff next month"],
  ["Restaurant POS integration", "pt-1", 160, 6200, 1, 1, "Second round interview"],
  ["Logistics tracking portal", "pt-3", 320, 14500, 3, 4, "Contract signed"],
  ["School fee collection system", "pt-4", 240, 9800, 2, 1, "Proposal sent"],
  ["Real estate listing site", "pt-2", 90, 3200, 1, 2, "Client chose another vendor"],
  ["HR self-service mobile app", "pt-4", 280, 12000, 3, 1, "Demo scheduled"],
  ["Loyalty points API", "pt-1", 60, 2400, 2, 3, "Budget withdrawn"],
  ["Warehouse barcode scanner", "pt-3", 110, 5100, 1, 4, "In delivery"],
  ["Micro-finance loan tracker", "pt-4", 400, 18000, 3, 2, "Completed and closed"],
];

const projectBids = BIDS.map(([title, portal, hours, cost, resource, status, remark], index) => ({
  _id: `pb-${index + 1}`,
  ProjectTitle: title,
  ProjectURL: `https://example.com/jobs/${1001 + index}`,
  ProjectDesc: `${title} for a client found through the bidding portal.`,
  Portal_ID: portal,
  EstimatedTime: hours,
  EstimatedCost: cost,
  ResourceID: resource,
  Status: status,
  Remark: remark,
}));

export const seed = {
  countries,
  states,
  cities,
  companies,
  roles,
  // The reference salary is only used to build the seed.
  positions: positions.map(({ salary: _salary, ...position }) => position),
  departments,
  employees,
  salaries,
  portals,
  projectBids,
  education: [
    {
      _id: "edu-1",
      EmployeeID: "emp-emp",
      SchoolUniversity: "Example Technological University",
      Degree: "B.E. (Information Technology)",
      Grade: "A",
      PassingOfYear: "2018",
    },
    {
      _id: "edu-2",
      EmployeeID: "emp-emp",
      SchoolUniversity: "No. 1 Basic Education High School, Thaton",
      Degree: "Matriculation",
      Grade: "Distinction",
      PassingOfYear: "2013",
    },
    {
      _id: "edu-3",
      EmployeeID: "emp-004",
      SchoolUniversity: "Sample University of Computer Studies",
      Degree: "B.C.Sc.",
      Grade: "B+",
      PassingOfYear: "2020",
    },
  ],
  familyInfo: [
    { _id: "fam-1", EmployeeID: "emp-emp", Name: "Daw Hla", Relationship: "Mother", DOB: "1965-02-10", Occupation: "Teacher" },
    { _id: "fam-2", EmployeeID: "emp-emp", Name: "U Tin", Relationship: "Father", DOB: "1962-09-28", Occupation: "Retired" },
  ],
  workExperience: [
    {
      _id: "wx-1",
      EmployeeID: "emp-emp",
      CompanyName: "Sample Soft",
      Designation: "Junior Developer",
      FromDate: "2019-01-01",
      ToDate: "2020-12-31",
    },
    {
      _id: "wx-2",
      EmployeeID: "emp-emp",
      CompanyName: "Demo Digital",
      Designation: "Web Developer",
      FromDate: "2021-01-15",
      ToDate: "2022-10-15",
    },
  ],
  leaves,
};
