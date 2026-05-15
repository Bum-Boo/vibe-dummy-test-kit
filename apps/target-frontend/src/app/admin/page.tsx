import Link from "next/link";
import { fetchAdminSummary } from "../../lib/api";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const userId = singleParam(params.userId) ?? "admin";
  const { currentUser, summary } = await fetchAdminSummary(userId);

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>Admin dashboard placeholder</strong>
          <span>
            Simulated session: <code>{currentUser.id}</code>
          </span>
        </div>
        <nav className="nav" aria-label="Admin navigation">
          <Link href="/">Switch user</Link>
          <Link href={`/projects?userId=${currentUser.id}`}>Projects</Link>
        </nav>
      </header>

      <section className="panel">
        <h1>Tenant overview</h1>
        <div className="metrics">
          <div>
            <strong>{summary.users}</strong>
            <span>Users</span>
          </div>
          <div>
            <strong>{summary.projects}</strong>
            <span>Projects</span>
          </div>
          <div>
            <strong>{summary.publicProjects}</strong>
            <span>Public pages</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Plans</h2>
        <div className="table">
          {summary.plans.map((plan) => (
            <div className="table-row" key={plan.userId}>
              <span>{plan.userId}</span>
              <span>{plan.plan}</span>
              <span>{plan.billingStatus}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function singleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

