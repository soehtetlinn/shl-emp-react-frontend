import { useAuth } from "../auth/AuthContext.jsx";
import { useApiData } from "../app/useApiData.js";
import { DashboardState, formatNumber } from "../components/dashboard.jsx";

/** Shows all but the last four characters of an account number as dots. */
const masked = (accountNo) => String(accountNo).replace(/.(?=.{4})/g, "•");

/** The signed-in employee's own salary details. Read-only: HR maintains them. */
export default function MySalaryPage() {
  const { user } = useAuth();
  const { data, error, reload } = useApiData({ pay: `/api/salary/${user.id}` });
  const salary = data?.pay.salary?.[0];

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>My Salary</h1>
          <p className="page-subtitle">Maintained by HR. Contact HR if anything looks wrong.</p>
        </div>
      </header>

      <DashboardState data={data} error={error} onRetry={reload}>
        {data && !salary && <p className="panel panel-empty">Your salary details are not on file yet.</p>}
        {salary && (
          <div className="pay-layout">
            <section className="panel">
              <header className="panel-header">
                <h2>Monthly pay</h2>
              </header>
              <dl className="pay-lines">
                <div>
                  <dt>Basic salary</dt>
                  <dd>{formatNumber(salary.BasicSalary)}</dd>
                </div>
                <div>
                  <dt>Tax deduction</dt>
                  <dd>− {formatNumber(salary.TaxDeduction)}</dd>
                </div>
                <div className="pay-total">
                  <dt>Net pay</dt>
                  <dd>{formatNumber(salary.BasicSalary - salary.TaxDeduction)}</dd>
                </div>
              </dl>
            </section>

            <section className="panel">
              <header className="panel-header">
                <h2>Paid into</h2>
              </header>
              <dl className="pay-lines">
                <div>
                  <dt>Bank</dt>
                  <dd>{salary.BankName}</dd>
                </div>
                <div>
                  <dt>Account holder</dt>
                  <dd>{salary.AccountHolderName}</dd>
                </div>
                <div>
                  <dt>Account no.</dt>
                  <dd>{masked(salary.AccountNo)}</dd>
                </div>
                <div>
                  <dt>IFSC code</dt>
                  <dd>{salary.IFSCcode}</dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </DashboardState>
    </section>
  );
}
