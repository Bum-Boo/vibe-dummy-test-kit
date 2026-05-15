import Link from "next/link";
import { getScoreboardRows, getStages } from "../lib/lab-data";

export const dynamic = "force-dynamic";

export default function Home() {
  const stages = getStages();
  const scoreboard = getScoreboardRows();
  const passCount = scoreboard.filter((row) => row.status === "PASS").length;
  const implemented = stages.filter((stage) => stage.status === "implemented").length;

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>BTS_sec Staircase Lab</strong>
          <span>Local-only educational benchmark</span>
        </div>
        <nav className="nav" aria-label="Main navigation">
          <Link href="/stages">Stages</Link>
          <Link href="/scoreboard">Scoreboard</Link>
          <a href="http://localhost:8080/health">Proxy health</a>
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">Beginner-friendly scanner validation lab</p>
        <h1>Practice security review with a staged local SaaS lab.</h1>
        <p>
          This dashboard reads the local stage manifests, expected findings, generated BTS_sec reports, and comparison
          results from the repository. It is built for demos and for learners who want to see why each finding matters.
        </p>
        <div className="actions">
          <Link className="button" href="/stages">
            Browse stages
          </Link>
          <Link className="button secondary" href="/scoreboard">
            View score
          </Link>
        </div>
      </section>

      <section className="metric-strip" aria-label="Lab status">
        <div>
          <span>{stages.length}</span>
          <p>stages</p>
        </div>
        <div>
          <span>{implemented}</span>
          <p>implemented</p>
        </div>
        <div>
          <span>
            {passCount}/{scoreboard.length}
          </span>
          <p>passing comparisons</p>
        </div>
      </section>

      <section className="section two-column" aria-labelledby="purpose-title">
        <div>
          <h2 id="purpose-title">What This Lab Is</h2>
          <p>
            A staircase benchmark for BTS_sec. Early stages isolate one mistake at a time; later stages combine
            frontend, backend, database, file upload, server configuration, and AI feature risks into a realistic local
            SaaS workflow.
          </p>
        </div>
        <div>
          <h2>How To Use It</h2>
          <ol className="steps">
            <li>Open the stage list and pick a topic.</li>
            <li>Read the scenario and Korean lesson.</li>
            <li>Run a scan with the command shown on the page.</li>
            <li>Compare the generated report against expected findings.</li>
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="safety-title">
        <h2 id="safety-title">Safety Rules</h2>
        <div className="notice-grid">
          <p className="notice">Run vulnerable stages on your own machine only.</p>
          <p className="notice">Scan known local stage folders only; external URLs are rejected.</p>
          <p className="notice">Use fake local credentials and deterministic demo data only.</p>
          <p className="notice">Do not deploy vulnerable stages or scan arbitrary external systems.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="quick-title">
        <h2 id="quick-title">Quick Commands</h2>
        <div className="command-grid">
          <code>pnpm --filter @bts-sec/lab-dashboard dev</code>
          <code>pnpm scan -- --stage stage-04-access-control</code>
          <code>pnpm compare -- --stage 04</code>
          <code>pnpm score</code>
        </div>
      </section>
    </main>
  );
}
