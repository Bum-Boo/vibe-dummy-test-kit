import Link from "next/link";
import { fetchProjects } from "../../lib/api";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const userId = singleParam(params.userId) ?? "alice";
  const { currentUser, projects } = await fetchProjects(userId);

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>{currentUser.name}</strong>
          <span>
            Simulated session: <code>{currentUser.id}</code>
          </span>
        </div>
        <nav className="nav" aria-label="Project navigation">
          <Link href="/">Switch user</Link>
          <Link href={`/projects/new?userId=${currentUser.id}`}>Create project</Link>
          {currentUser.role === "admin" ? <Link href={`/admin?userId=${currentUser.id}`}>Admin</Link> : null}
        </nav>
      </header>

      <section className="section">
        <h1>Projects</h1>
        <p className="muted">
          The API returns only projects readable by the current simulated user. Admin can see all projects.
        </p>
        <div className="grid">
          {projects.map((project) => (
            <article className="card" key={project.id}>
              <span className="badge">{project.isPublic ? "Public" : "Private"}</span>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <dl className="facts">
                <div>
                  <dt>Theme</dt>
                  <dd>{project.theme}</dd>
                </div>
                <div>
                  <dt>Image</dt>
                  <dd>{project.imageKey ?? "none"}</dd>
                </div>
              </dl>
              <div className="actions">
                <Link className="button" href={`/projects/${project.id}?userId=${currentUser.id}`}>
                  Details
                </Link>
                {project.isPublic ? (
                  <Link className="button secondary" href={`/portfolio/${project.slug}`}>
                    Public page
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

function singleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

