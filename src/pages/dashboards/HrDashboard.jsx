import { useState } from "react";
import { Banknote, Building, CalendarClock, Check, Users, X } from "lucide-react";
import { api } from "../../api/client.js";
import { useApiData } from "../../app/useApiData.js";
import Avatar from "../../components/Avatar.jsx";
import { BarList, DashboardState, Panel, StatCard, countBy, formatNumber } from "../../components/dashboard.jsx";
import { useToast } from "../../components/Toast.jsx";
import { LEAVE_STATUS, dateOnly, fullName } from "../../resources/helpers.js";

const PENDING = 1;
const APPROVED = 2;
const REJECTED = 3;
const STATUS_TONE = { Pending: "warning", Approved: "success", Rejected: "danger" };

const isActive = (employee) => !employee.TerminateDate;

function PendingLeave({ leave, onDecide, busy }) {
  const employee = leave.employee?.[0];
  const name = fullName(employee) || "Unknown employee";
  return (
    <li className="list-row">
      <Avatar name={name} size={36} />
      <div className="list-main">
        <strong>{name}</strong>
        <span className="muted">
          {leave.Leavetype} · {dateOnly(leave.FromDate)} to {dateOnly(leave.ToDate)}
        </span>
        <span className="list-note">{leave.Reasonforleave}</span>
      </div>
      <div className="list-actions">
        <button type="button" className="btn btn-success" disabled={busy} onClick={() => onDecide(leave, APPROVED)}>
          <Check size={15} aria-hidden="true" />
          Approve
        </button>
        <button type="button" className="btn" disabled={busy} onClick={() => onDecide(leave, REJECTED)}>
          <X size={15} aria-hidden="true" />
          Reject
        </button>
      </div>
    </li>
  );
}

export default function HrDashboard() {
  const notify = useToast();
  const [busy, setBusy] = useState(false);
  const { data, error, reload } = useApiData({
    employees: "/api/employee",
    departments: "/api/department",
    leaves: "/api/leave-application-hr",
    salaries: "/api/salary",
  });

  const decide = async (leave, status) => {
    setBusy(true);
    try {
      await api.put(`/api/leave-application-hr/${leave._id}`, { Status: status });
      notify(`Leave ${status === APPROVED ? "approved" : "rejected"} for ${fullName(leave.employee?.[0])}`);
      await reload();
    } catch (decideError) {
      notify(decideError.message, "danger");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>HR Dashboard</h1>
          <p className="page-subtitle">People, leave and payroll at a glance.</p>
        </div>
      </header>

      <DashboardState data={data} error={error} onRetry={reload}>
        {data && <Content data={data} busy={busy} onDecide={decide} />}
      </DashboardState>
    </section>
  );
}

function Content({ data, busy, onDecide }) {
  const active = data.employees.filter(isActive);
  const pending = data.leaves.filter((leave) => Number(leave.Status) === PENDING);
  const payroll = data.salaries.reduce((sum, row) => sum + Number(row.salary?.[0]?.BasicSalary || 0), 0);
  const byDepartment = countBy(active, (e) => e.department?.[0]?.DepartmentName);
  const byStatus = countBy(data.leaves, (leave) => LEAVE_STATUS[Number(leave.Status)]).map((item) => ({
    ...item,
    tone: STATUS_TONE[item.label],
  }));
  const newest = [...active]
    .sort((a, b) => String(b.DateOfJoining).localeCompare(String(a.DateOfJoining)))
    .slice(0, 5);

  return (
    <>
      <div className="stat-grid">
        <StatCard icon={Users} label="Active employees" value={active.length} to="/hr/employee" />
        <StatCard icon={Building} label="Departments" value={data.departments.length} tone="info" to="/hr/department" />
        <StatCard
          icon={CalendarClock}
          label="Leave awaiting review"
          value={pending.length}
          tone="warning"
          to="/hr/leave-application"
        />
        <StatCard
          icon={Banknote}
          label="Monthly payroll"
          value={formatNumber(payroll)}
          hint={`${data.salaries.length} of ${data.employees.length} employees on file`}
          tone="success"
          to="/hr/salary"
        />
      </div>

      <div className="panel-grid">
        <Panel title="Leave awaiting review" action={{ to: "/hr/leave-application", label: "All applications" }} wide>
          {pending.length === 0 ? (
            <p className="panel-empty">Nothing to review. You're all caught up.</p>
          ) : (
            <ul className="list">
              {pending.map((leave) => (
                <PendingLeave key={leave._id} leave={leave} busy={busy} onDecide={onDecide} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Headcount by department">
          <BarList items={byDepartment} />
        </Panel>

        <Panel title="Leave applications by status">
          <BarList items={byStatus} />
        </Panel>

        <Panel title="Newest team members" action={{ to: "/hr/employee", label: "All employees" }} wide>
          <ul className="list">
            {newest.map((employee) => (
              <li key={employee._id} className="list-row">
                <Avatar name={fullName(employee)} size={36} />
                <div className="list-main">
                  <strong>{fullName(employee)}</strong>
                  <span className="muted">
                    {employee.position?.[0]?.PositionName} · {employee.department?.[0]?.DepartmentName}
                  </span>
                </div>
                <span className="muted">Joined {dateOnly(employee.DateOfJoining)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
