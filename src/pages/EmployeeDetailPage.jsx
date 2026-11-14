import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../api/client.js";
import { fullName } from "../resources/helpers.js";

const TABS = [
  { to: "personal-info", label: "Personal Information" },
  { to: "education", label: "Education" },
  { to: "family-info", label: "Dependents" },
  { to: "work-experience", label: "Work Experience" },
];

/** HR's view of a single employee: a header plus tabs that reuse the employee's own screens. */
export default function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setEmployee(null);
    api
      .get(`/api/personal-info/${employeeId}`)
      .then((data) => !cancelled && setEmployee(data))
      .catch(() => {
        // The tab below reports its own loading error; the header just stays generic.
      });
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  return (
    <div className="detail">
      <Link className="back-link" to="/hr/employee">
        <ArrowLeft size={16} aria-hidden="true" />
        All employees
      </Link>
      <p className="detail-title">
        {employee ? fullName(employee) : "Employee"}
        {employee?.EmployeeCode && <span className="badge badge-muted">{employee.EmployeeCode}</span>}
      </p>
      <nav className="tabs" aria-label="Employee sections">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className="tab">
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet context={{ employeeId }} />
    </div>
  );
}
