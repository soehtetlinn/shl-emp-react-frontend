import { Link } from "react-router-dom";
import { CalendarCheck, CalendarClock, CalendarPlus, CalendarX, Wallet } from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useApiData } from "../../app/useApiData.js";
import Avatar from "../../components/Avatar.jsx";
import { DashboardState, Panel, StatCard, formatNumber } from "../../components/dashboard.jsx";
import { LEAVE_STATUS, dateOnly, fullName, leaveStatusTone } from "../../resources/helpers.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Calendar days covered by a leave, counting both ends. */
function daysOf(leave) {
  const from = new Date(dateOnly(leave.FromDate));
  const to = new Date(dateOnly(leave.ToDate));
  return Math.max(1, Math.round((to - from) / MS_PER_DAY) + 1);
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { data, error, reload } = useApiData({
    profile: `/api/personal-info/${user.id}`,
    leave: `/api/leave-application-emp/${user.id}`,
    pay: `/api/salary/${user.id}`,
  });

  return (
    <section className="page">
      <DashboardState data={data} error={error} onRetry={reload}>
        {data && <Content data={data} />}
      </DashboardState>
    </section>
  );
}

function Content({ data }) {
  const { profile } = data;
  const name = fullName(profile);
  const leaves = data.leave.leaveApplication ?? [];
  const withStatus = (status) => leaves.filter((leave) => LEAVE_STATUS[Number(leave.Status)] === status);
  const approvedDays = withStatus("Approved").reduce((sum, leave) => sum + daysOf(leave), 0);
  const recent = [...leaves].sort((a, b) => String(b.FromDate).localeCompare(String(a.FromDate))).slice(0, 5);
  const salary = data.pay.salary?.[0];

  return (
    <>
      <div className="welcome">
        <Avatar name={name} size={64} />
        <div className="welcome-text">
          <h1>Welcome back, {profile.FirstName}</h1>
          <p>
            {profile.position?.[0]?.PositionName} · {profile.department?.[0]?.DepartmentName} · {profile.EmployeeCode}
          </p>
        </div>
        <Link className="btn btn-on-dark" to="/employee/leave-application">
          <CalendarPlus size={16} aria-hidden="true" />
          Apply for leave
        </Link>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={CalendarClock}
          label="Pending requests"
          value={withStatus("Pending").length}
          tone="warning"
          to="/employee/leave-application"
        />
        <StatCard
          icon={CalendarCheck}
          label="Approved leave"
          value={`${approvedDays} ${approvedDays === 1 ? "day" : "days"}`}
          hint={`${withStatus("Approved").length} requests`}
          tone="success"
          to="/employee/leave-application"
        />
        <StatCard
          icon={CalendarX}
          label="Rejected requests"
          value={withStatus("Rejected").length}
          tone="danger"
          to="/employee/leave-application"
        />
        <StatCard
          icon={Wallet}
          label="Net monthly pay"
          value={salary ? formatNumber(salary.BasicSalary - salary.TaxDeduction) : "—"}
          hint={salary ? "After tax deduction" : "Not on file yet"}
          to="/employee/salary"
        />
      </div>

      <div className="panel-grid">
        <Panel title="My recent leave" action={{ to: "/employee/leave-application", label: "All requests" }} wide>
          {recent.length === 0 ? (
            <p className="panel-empty">You haven't applied for leave yet.</p>
          ) : (
            <ul className="list">
              {recent.map((leave) => {
                const status = LEAVE_STATUS[Number(leave.Status)];
                return (
                  <li key={leave._id} className="list-row">
                    <div className="list-main">
                      <strong>{leave.Leavetype}</strong>
                      <span className="muted">
                        {dateOnly(leave.FromDate)} to {dateOnly(leave.ToDate)} · {daysOf(leave)}{" "}
                        {daysOf(leave) === 1 ? "day" : "days"}
                      </span>
                      <span className="list-note">{leave.Reasonforleave}</span>
                    </div>
                    <span className={`badge badge-${leaveStatusTone(status)}`}>{status}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
