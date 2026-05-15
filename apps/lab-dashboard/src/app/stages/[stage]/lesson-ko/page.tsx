import Link from "next/link";
import { notFound } from "next/navigation";
import { getStages, readLessonKo } from "../../../../lib/lab-data";

export const dynamic = "force-dynamic";

type LessonPageProps = {
  params: Promise<{ stage: string }>;
};

export function generateStaticParams() {
  return getStages().map((stage) => ({ stage: stage.shortId }));
}

export default async function LessonKoPage({ params }: LessonPageProps) {
  const { stage: stageParam } = await params;
  const lesson = readLessonKo(stageParam);

  if (!lesson) {
    notFound();
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>lesson-ko.md</strong>
          <span>{lesson.stage.title}</span>
        </div>
        <nav className="nav" aria-label="Lesson navigation">
          <Link href={`/stages/${lesson.stage.shortId}`}>Stage detail</Link>
          <Link href="/stages">Stages</Link>
        </nav>
      </header>

      <section className="section">
        <p className="eyebrow">{lesson.path}</p>
        <h1>Korean Lesson</h1>
        <pre className="markdown-panel">{lesson.content}</pre>
      </section>
    </main>
  );
}
