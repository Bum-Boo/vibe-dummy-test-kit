import Link from "next/link";
import { notFound } from "next/navigation";
import {
  expectedFindingFor,
  formatPercent,
  getReportView,
  getStages,
  severities,
  type Severity
} from "../../../lib/lab-data";

export const dynamic = "force-dynamic";

type ReportPageProps = {
  params: Promise<{ stage: string }>;
};

export function generateStaticParams() {
  return getStages().map((stage) => ({ stage: stage.shortId }));
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { stage: stageParam } = await params;
  const view = getReportView(stageParam);

  if (!view) {
    notFound();
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>Report Viewer</strong>
          <span>{view.stage.title}</span>
        </div>
        <nav className="nav" aria-label="Report navigation">
          <Link href={`/stages/${view.stage.shortId}`}>Stage detail</Link>
          <Link href="/scoreboard">Scoreboard</Link>
        </nav>
      </header>

      <section className="section">
        <p className="eyebrow">Stage {view.stage.number}</p>
        <h1>{view.stage.title}</h1>
        <p className="lead">
          This page reads the generated report and comparison files from the local <code>reports</code> directory.
        </p>
      </section>

      {view.report ? (
        <>
          <section className="metric-strip" aria-label="Report summary counts">
            {severities.map((severity) => (
              <div key={severity}>
                <span>{view.report?.summary[severity as Severity] ?? 0}</span>
                <p>{severity}</p>
              </div>
            ))}
          </section>

          <section className="section two-column" aria-labelledby="report-source-title">
            <div>
              <h2 id="report-source-title">Report Source</h2>
              <dl className="definition-list">
                <div>
                  <dt>JSON</dt>
                  <dd>
                    <code>{view.report.path}</code>
                  </dd>
                </div>
                {view.report.markdownPath ? (
                  <div>
                    <dt>Markdown</dt>
                    <dd>
                      <code>{view.report.markdownPath}</code>
                    </dd>
                  </div>
                ) : null}
                {view.report.scannerName ? (
                  <div>
                    <dt>Scanner</dt>
                    <dd>
                      {view.report.scannerName}
                      {view.report.scannerMode ? ` (${view.report.scannerMode})` : ""}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
            <div>
              <h2>Plain-Language Summary</h2>
              <p>
                Found {view.report.findings.length} finding{view.report.findings.length === 1 ? "" : "s"} for this
                stage. Each item below pairs technical evidence with learner-facing context and a recommended next fix.
              </p>
            </div>
          </section>

          <section className="section" aria-labelledby="findings-title">
            <h2 id="findings-title">Findings</h2>
            {view.report.findings.length > 0 ? (
              <div className="finding-list">
                {view.report.findings.map((finding) => {
                  const expected = expectedFindingFor(view.stage, finding);
                  return (
                    <article className="finding-card" key={finding.id}>
                      <div className="finding-header">
                        <h3>{finding.id}</h3>
                        {finding.severity ? (
                          <span className={`severity severity-${finding.severity}`}>{finding.severity}</span>
                        ) : null}
                      </div>
                      <p>{finding.title}</p>
                      <div className="report-block">
                        <h4>Plain-language explanation</h4>
                        <p>
                          {finding.explanation ||
                            expected?.title ||
                            "This finding needs review because BTS_sec detected a security-relevant pattern."}
                        </p>
                      </div>
                      <div className="report-block">
                        <h4>Technical evidence</h4>
                        <dl className="compact-meta">
                          {finding.category ? (
                            <div>
                              <dt>Category</dt>
                              <dd>{finding.category}</dd>
                            </div>
                          ) : null}
                          {finding.file ? (
                            <div>
                              <dt>File</dt>
                              <dd>
                                <code>{finding.file}</code>
                              </dd>
                            </div>
                          ) : null}
                          {finding.route ? (
                            <div>
                              <dt>Route</dt>
                              <dd>
                                <code>{finding.route}</code>
                              </dd>
                            </div>
                          ) : null}
                        </dl>
                        <pre className="evidence">{finding.evidence || expected?.evidence.join("\n") || "No evidence text supplied."}</pre>
                      </div>
                      <div className="report-block">
                        <h4>Recommended fix</h4>
                        <p>
                          {finding.recommendation ||
                            expected?.fixSummary ||
                            "Open the stage expected-report.md file for the safe pattern and remediation notes."}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="notice">No findings were reported for this stage.</p>
            )}
          </section>
        </>
      ) : (
        <section className="section">
          <h2>No Generated Report Yet</h2>
          <p>Generate the local report first, then refresh this page.</p>
          <code className="command">{view.command}</code>
        </section>
      )}

      <section className="section" id="comparison" aria-labelledby="comparison-title">
        <h2 id="comparison-title">Comparison Result</h2>
        {view.comparison ? (
          <div className="comparison-panel">
            <div className="metric-strip compact" aria-label="Comparison summary">
              <div>
                <span>{view.comparison.overall}</span>
                <p>overall</p>
              </div>
              <div>
                <span>{view.comparison.matchedFindings}</span>
                <p>matched</p>
              </div>
              <div>
                <span>{view.comparison.falsePositives}</span>
                <p>false positives</p>
              </div>
              <div>
                <span>{formatPercent(view.comparison.severityAccuracy)}</span>
                <p>severity</p>
              </div>
            </div>
            <p>
              Source: <code>{view.comparison.path}</code>
            </p>
            <div className="finding-list">
              {view.comparison.matches.map((match) => (
                <article className="finding-card compact-card" key={match.id}>
                  <div className="finding-header">
                    <h3>{match.id}</h3>
                    <span className={match.matched && match.issues.length === 0 ? "status-pass" : "status-fail"}>
                      {match.matched && match.issues.length === 0 ? "pass" : "review"}
                    </span>
                  </div>
                  <p>{match.title}</p>
                  {match.issues.length > 0 ? (
                    <ul className="plain-list">
                      {match.issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No comparison issues.</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p>No comparison file exists yet.</p>
            <code className="command">pnpm compare -- --stage {view.stage.number}</code>
          </div>
        )}
      </section>
    </main>
  );
}
