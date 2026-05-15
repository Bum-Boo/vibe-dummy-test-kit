import Link from "next/link";
import { fetchPublicPortfolio } from "../../../lib/api";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { slug } = await params;
  const { project } = await fetchPublicPortfolio(slug);

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>Public portfolio</strong>
          <span>{project.slug}</span>
        </div>
        <nav className="nav" aria-label="Public navigation">
          <Link href="/">Demo users</Link>
        </nav>
      </header>

      <section className="portfolio">
        <span className="badge">{project.theme}</span>
        <h1>{project.title}</h1>
        <p>{project.summary}</p>
        <blockquote>{project.aiProfileText ?? "AI profile text has not been generated yet."}</blockquote>
      </section>
    </main>
  );
}

