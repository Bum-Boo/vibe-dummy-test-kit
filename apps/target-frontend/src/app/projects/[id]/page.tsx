import Link from "next/link";
import { fetchProject } from "../../../lib/api";
import { ProjectActions } from "./ProjectActions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const userId = singleParam(query.userId) ?? "alice";
  const { currentUser, project } = await fetchProject(userId, id);

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>{project.title}</strong>
          <span>
            Owner: <code>{project.ownerId}</code>
          </span>
        </div>
        <nav className="nav" aria-label="Project detail navigation">
          <Link href={`/projects?userId=${currentUser.id}`}>Projects</Link>
          {project.isPublic ? <Link href={`/portfolio/${project.slug}`}>Public page</Link> : null}
        </nav>
      </header>

      <section className="panel">
        <h1>{project.title}</h1>
        <p>{project.summary}</p>
        <dl className="facts wide">
          <div>
            <dt>Visibility</dt>
            <dd>{project.isPublic ? "public" : "private"}</dd>
          </div>
          <div>
            <dt>Theme</dt>
            <dd>{project.theme}</dd>
          </div>
          <div>
            <dt>Image key</dt>
            <dd>{project.imageKey ?? "none"}</dd>
          </div>
          <div>
            <dt>AI profile text</dt>
            <dd>{project.aiProfileText ?? "none"}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>Safe placeholders</h2>
        <p>
          The upload and AI actions are deterministic placeholders. They do not accept arbitrary files and do not call
          external AI APIs.
        </p>
        <ProjectActions userId={currentUser.id} projectId={project.id} />
      </section>
    </main>
  );
}

function singleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

