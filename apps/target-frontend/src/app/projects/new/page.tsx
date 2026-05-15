import Link from "next/link";
import { CreateProjectForm } from "./CreateProjectForm";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewProjectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const userId = singleParam(params.userId) ?? "alice";

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>Create project</strong>
          <span>
            Simulated session: <code>{userId}</code>
          </span>
        </div>
        <nav className="nav" aria-label="Create navigation">
          <Link href={`/projects?userId=${userId}`}>Back to projects</Link>
        </nav>
      </header>

      <section className="panel">
        <h1>New portfolio project</h1>
        <p>
          This form calls the local target API. There is no real billing provider, auth provider, or AI provider.
        </p>
        <CreateProjectForm userId={userId} />
      </section>
    </main>
  );
}

function singleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

