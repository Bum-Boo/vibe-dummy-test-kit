import Link from "next/link";
import { formatPercent, getScoreboardRows } from "../../lib/lab-data";

export const dynamic = "force-dynamic";

export default function ScoreboardPage() {
  const rows = getScoreboardRows();
  const passed = rows.filter((row) => row.status === "PASS").length;
  const partial = rows.filter((row) => row.status === "PARTIAL").length;
  const failed = rows.filter((row) => row.status === "FAIL").length;

  return (
    <main className="shell wide">
      <header className="topbar">
        <div className="brand">
          <strong>Scoreboard</strong>
          <span>Expected-vs-actual benchmark status</span>
        </div>
        <nav className="nav" aria-label="Scoreboard navigation">
          <Link href="/">Home</Link>
          <Link href="/stages">Stages</Link>
        </nav>
      </header>

      <section className="section">
        <p className="eyebrow">Scanner validation</p>
        <h1>Per-stage BTS_sec comparison results.</h1>
        <p className="lead">
          PASS means the generated report matches expected findings with acceptable quality checks. PARTIAL means the
          stage has no comparison yet or only some expected findings matched.
        </p>
      </section>

      <section className="metric-strip" aria-label="Score totals">
        <div>
          <span>{passed}</span>
          <p>pass</p>
        </div>
        <div>
          <span>{partial}</span>
          <p>partial</p>
        </div>
        <div>
          <span>{failed}</span>
          <p>fail</p>
        </div>
      </section>

      <section className="section">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Stage</th>
                <th>Status</th>
                <th>Recall</th>
                <th>Precision</th>
                <th>Severity</th>
                <th>Report quality</th>
                <th>Counts</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr id={row.stage.shortId} key={row.stage.id}>
                  <td>
                    <strong>Stage {row.stage.number}</strong>
                    <span>{row.stage.title}</span>
                  </td>
                  <td>
                    <span className={`score-status score-${row.status.toLowerCase()}`}>{row.status}</span>
                  </td>
                  <td>{formatPercent(row.recall)}</td>
                  <td>{formatPercent(row.precision)}</td>
                  <td>{formatPercent(row.severityAccuracy)}</td>
                  <td>{row.reportQuality}</td>
                  <td>
                    <code>
                      {row.matchedFindings}/{row.expectedFindings} matched, {row.falsePositives} FP
                    </code>
                  </td>
                  <td>
                    <Link href={`/reports/${row.stage.shortId}`}>{row.note}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
