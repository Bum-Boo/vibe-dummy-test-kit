import Link from "next/link";
import { fetchDemoUsers } from "../lib/api";

export default async function TargetHome() {
  const users = await fetchDemoUsers();

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>AI Portfolio Builder</strong>
          <span>Safe local baseline for staircase stages</span>
        </div>
        <span className="badge">No real auth, billing, AI, or cloud services</span>
      </header>

      <section className="hero">
        <h1>Build and publish demo AI portfolio pages</h1>
        <p>
          This base app models a small SaaS product with users, projects, uploaded image
          placeholders, AI text placeholders, public portfolios, admin reporting, and plan fields.
        </p>
      </section>

      <section className="section" aria-labelledby="users-title">
        <h2 id="users-title">Choose a demo session</h2>
        <div className="grid">
          {users.map((user) => (
            <article className="card" key={user.id}>
              <span className="badge">{user.role}</span>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <dl className="facts">
                <div>
                  <dt>Plan</dt>
                  <dd>{user.plan}</dd>
                </div>
                <div>
                  <dt>Billing</dt>
                  <dd>{user.billingStatus}</dd>
                </div>
              </dl>
              <div className="actions">
                <Link className="button" href={`/projects?userId=${user.id}`}>
                  Open projects
                </Link>
                {user.role === "admin" ? (
                  <Link className="button secondary" href={`/admin?userId=${user.id}`}>
                    Admin page
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

