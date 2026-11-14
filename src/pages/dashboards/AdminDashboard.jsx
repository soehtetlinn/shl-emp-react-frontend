import { Banknote, Briefcase, Building, CircleDollarSign, ShieldCheck, Trophy } from "lucide-react";
import { useApiData } from "../../app/useApiData.js";
import { BarList, DashboardState, Panel, StatCard, countBy, formatNumber } from "../../components/dashboard.jsx";
import { BID_STATUS } from "../../resources/admin.js";

const OPEN = 1;
const AWARDED = 4;
const STATUS_TONE = { Open: "info", Awarded: "success", Cancelled: "danger", Closed: "muted" };

const statusOf = (bid) => BID_STATUS[Number(bid.Status)];
const totalCost = (bids) => bids.reduce((sum, bid) => sum + Number(bid.EstimatedCost || 0), 0);

export default function AdminDashboard() {
  const { data, error, reload } = useApiData({
    roles: "/api/role",
    positions: "/api/position",
    departments: "/api/department",
    bids: "/api/admin/project-bid",
  });

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="page-subtitle">Organisation setup and the project bidding pipeline.</p>
        </div>
      </header>

      <DashboardState data={data} error={error} onRetry={reload}>
        {data && <Content data={data} />}
      </DashboardState>
    </section>
  );
}

function Content({ data }) {
  const open = data.bids.filter((bid) => Number(bid.Status) === OPEN);
  const awarded = data.bids.filter((bid) => Number(bid.Status) === AWARDED);
  const byStatus = countBy(data.bids, statusOf).map((item) => ({ ...item, tone: STATUS_TONE[item.label] }));

  const costByPortal = new Map();
  for (const bid of data.bids) {
    const portal = bid.portals?.[0]?.PortalName ?? "Unknown";
    costByPortal.set(portal, (costByPortal.get(portal) ?? 0) + Number(bid.EstimatedCost || 0));
  }
  const byPortal = [...costByPortal].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  return (
    <>
      <div className="stat-grid">
        <StatCard
          icon={CircleDollarSign}
          label="Open bids"
          value={open.length}
          hint={`${formatNumber(totalCost(open))} estimated value`}
          to="/admin/project-bid"
        />
        <StatCard
          icon={Trophy}
          label="Awarded bids"
          value={awarded.length}
          hint={`${formatNumber(totalCost(awarded))} estimated value`}
          tone="success"
          to="/admin/project-bid"
        />
        <StatCard icon={ShieldCheck} label="Roles" value={data.roles.length} tone="info" to="/admin/role" />
        <StatCard icon={Briefcase} label="Positions" value={data.positions.length} tone="info" to="/admin/position" />
        <StatCard icon={Building} label="Departments" value={data.departments.length} tone="info" to="/admin/department" />
      </div>

      <div className="panel-grid">
        <Panel title="Bids by status">
          <BarList items={byStatus} />
        </Panel>

        <Panel title="Estimated value by portal">
          <BarList items={byPortal} />
        </Panel>

        <Panel title="Open bids" action={{ to: "/admin/project-bid", label: "All bids" }} wide>
          {open.length === 0 ? (
            <p className="panel-empty">No open bids right now.</p>
          ) : (
            <ul className="list">
              {open.map((bid) => (
                <li key={bid._id} className="list-row">
                  <span className="stat-icon stat-icon-primary">
                    <Banknote size={18} aria-hidden="true" />
                  </span>
                  <div className="list-main">
                    <strong>{bid.ProjectTitle}</strong>
                    <span className="muted">
                      {bid.portals?.[0]?.PortalName} · {formatNumber(bid.EstimatedTime)} hours
                    </span>
                    <span className="list-note">{bid.Remark}</span>
                  </div>
                  <strong>{formatNumber(bid.EstimatedCost)}</strong>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
