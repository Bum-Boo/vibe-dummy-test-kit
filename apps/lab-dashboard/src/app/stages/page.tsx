import Link from "next/link";
import { getStages } from "../../lib/lab-data";

export const dynamic = "force-dynamic";

export default function StagesPage() {
  const stages = getStages();

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>Stages</strong>
          <span>Staircase benchmark map</span>
        </div>
        <nav className="nav" aria-label="Stage navigation">
          <Link href="/">Home</Link>
          <Link href="/scoreboard">Scoreboard</Link>
        </nav>
      </header>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Stage list</p>
            <h1>Pick a security mistake to study.</h1>
          </div>
          <p>
            Each stage links to its scenario, local scan command, expected findings, Korean lesson, generated report, and
            comparison result when those files exist.
          </p>
        </div>

        <div className="stage-list">
          {stages.map((stage) => (
            <article className="stage-row" key={stage.id}>
              <div className="stage-number">Stage {stage.number}</div>
              <div className="stage-main">
                <h2>
                  <Link href={`/stages/${stage.shortId}`}>{stage.title}</Link>
                </h2>
                <p>{stage.focus}</p>
                <div className="tag-row">
                  <span>{stage.difficulty}</span>
                  <span>{stage.expectedRisk}</span>
                  <span>{stage.scanMode} scan</span>
                  {stage.topics.slice(0, 3).map((topic) => (
                    <span key={topic}>{topic}</span>
                  ))}
                </div>
              </div>
              <div className="stage-actions">
                <Link href={`/stages/${stage.shortId}`}>Details</Link>
                {stage.hasReport ? <Link href={`/reports/${stage.shortId}`}>Report</Link> : <code>pnpm scan -- --stage {stage.id}</code>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
