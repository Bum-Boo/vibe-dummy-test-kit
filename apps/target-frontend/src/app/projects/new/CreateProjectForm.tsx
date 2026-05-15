"use client";

import { useState } from "react";
import { publicApiBase, type PortfolioProject } from "../../../lib/api";

export function CreateProjectForm({ userId }: { userId: string }) {
  const [createdProject, setCreatedProject] = useState<PortfolioProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${publicApiBase}/projects?userId=${encodeURIComponent(userId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(formData.get("title") ?? ""),
        summary: String(formData.get("summary") ?? ""),
        theme: String(formData.get("theme") ?? "minimal"),
        isPublic: formData.get("isPublic") === "on"
      })
    });

    if (!response.ok) {
      setError(`Create failed with HTTP ${response.status}`);
      return;
    }

    const data = (await response.json()) as { project: PortfolioProject };
    setCreatedProject(data.project);
    event.currentTarget.reset();
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Project title
        <input name="title" required defaultValue="New Local Portfolio" />
      </label>
      <label>
        Summary
        <textarea name="summary" required defaultValue="A safe local demo project for the staircase lab." />
      </label>
      <label>
        Theme
        <select name="theme" defaultValue="minimal">
          <option value="minimal">Minimal</option>
          <option value="bold">Bold</option>
          <option value="editorial">Editorial</option>
        </select>
      </label>
      <label className="checkbox">
        <input name="isPublic" type="checkbox" />
        Publish as public portfolio
      </label>
      <button className="button" type="submit">
        Create project
      </button>

      {error ? <p className="error">{error}</p> : null}
      {createdProject ? (
        <p className="success">
          Created <strong>{createdProject.title}</strong>. Open it from the project list.
        </p>
      ) : null}
    </form>
  );
}

