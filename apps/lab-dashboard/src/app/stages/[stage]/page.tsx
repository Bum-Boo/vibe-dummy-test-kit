import Link from "next/link";
import { notFound } from "next/navigation";
import { getStage, getStages, severityLabel } from "../../../lib/lab-data";

export const dynamic = "force-dynamic";

type StageDetailPageProps = {
  params: Promise<{ stage: string }>;
};

export function generateStaticParams() {
  return getStages().map((stage) => ({ stage: stage.shortId }));
}

export default async function StageDetailPage({ params }: StageDetailPageProps) {
  const { stage: stageParam } = await params;
  const stage = getStage(stageParam);

  if (!stage) {
    notFound();
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>Stage {stage.number}</strong>
          <span>{stage.title}</span>
        </div>
        <nav className="nav" aria-label="Stage detail navigation">
          <Link href="/stages">Stages</Link>
          <Link href="/scoreboard">Scoreboard</Link>
        </nav>
      </header>

      <section className="section">
        <p className="eyebrow">{stage.difficulty}</p>
        <h1>{stage.title}</h1>
        <p className="lead">{stage.focus}</p>
        <div className="tag-row">
          <span>{stage.status}</span>
          <span>{stage.scanMode} scan</span>
          <span>{severityLabel(stage.expectedSummary)}</span>
        </div>
      </section>

      <section className="section two-column" aria-labelledby="scenario-title">
        <div>
          <h2 id="scenario-title">Scenario</h2>
          <p>{stage.readmeExcerpt}</p>
          <p>
            Target: <code>{stage.targetBaseUrl}</code>
          </p>
        </div>
        <div>
          <h2>Demo Users</h2>
          <dl className="definition-list">
            <div>
              <dt>Alice</dt>
              <dd>Standard user used for owner-specific examples.</dd>
            </div>
            <div>
              <dt>Bob</dt>
              <dd>Second standard user used for cross-user checks.</dd>
            </div>
            <div>
              <dt>Admin</dt>
              <dd>Local demo administrator for admin-route examples.</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section two-column" aria-labelledby="try-title">
        <div>
          <h2 id="try-title">What To Try</h2>
          <ol className="steps">
            <li>
              Review <code>stages/{stage.id}</code>.
            </li>
            <li>
              Generate a report with <code>pnpm scan -- --stage {stage.id}</code>.
            </li>
            <li>
              Compare it with <code>pnpm compare -- --stage {stage.number}</code>.
            </li>
            <li>Open the report viewer to inspect evidence and fixes.</li>
          </ol>
        </div>
        <div>
          <h2>Routes And Services</h2>
          {stage.routes.length > 0 ? (
            <ul className="plain-list">
              {stage.routes.map((route) => (
                <li key={route}>
                  <code>{route}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p>This stage is primarily a code fixture.</p>
          )}
          {stage.services.length > 0 ? <p>Services: {stage.services.join(", ")}</p> : <p>No extra services required.</p>}
        </div>
      </section>

      <section className="section" aria-labelledby="findings-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Expected BTS_sec output</p>
            <h2 id="findings-title">What BTS_sec Should Find</h2>
          </div>
          <p>{stage.expectedRisk}</p>
        </div>
        {stage.expectedFindings.length > 0 ? (
          <div className="finding-list">
            {stage.expectedFindings.map((finding) => (
              <article className="finding-card" key={finding.id}>
                <div className="finding-header">
                  <h3>{finding.id}</h3>
                  <span className={`severity severity-${finding.severity}`}>{finding.severity}</span>
                </div>
                <p>{finding.title}</p>
                <dl className="compact-meta">
                  <div>
                    <dt>Category</dt>
                    <dd>{finding.category}</dd>
                  </div>
                  {finding.files[0] ? (
                    <div>
                      <dt>File</dt>
                      <dd>
                        <code>{finding.files[0]}</code>
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
              </article>
            ))}
          </div>
        ) : (
          <p className="notice">No Critical or High findings are expected for this baseline stage.</p>
        )}
      </section>

      <section className="section" aria-labelledby="links-title">
        <h2 id="links-title">Stage Files And Reports</h2>
        <div className="link-grid">
          <Link href={`/stages/${stage.shortId}/lesson-ko`}>Open Korean lesson</Link>
          {stage.hasReport ? (
            <Link href={`/reports/${stage.shortId}`}>Open generated report</Link>
          ) : (
            <code>pnpm scan -- --stage {stage.id}</code>
          )}
          {stage.hasComparison ? (
            <Link href={`/reports/${stage.shortId}#comparison`}>Open comparison result</Link>
          ) : (
            <code>pnpm compare -- --stage {stage.number}</code>
          )}
        </div>
      </section>
    </main>
  );
}
