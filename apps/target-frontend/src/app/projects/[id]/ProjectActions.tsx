"use client";

import { useState } from "react";
import { publicApiBase, type PortfolioProject } from "../../../lib/api";

export function ProjectActions({ userId, projectId }: { userId: string; projectId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [project, setProject] = useState<PortfolioProject | null>(null);

  async function postAction(action: "upload-placeholder" | "generate-profile") {
    setMessage(null);
    const response = await fetch(
      `${publicApiBase}/projects/${encodeURIComponent(projectId)}/${action}?userId=${encodeURIComponent(userId)}`,
      {
        method: "POST",
        headers: action === "upload-placeholder" ? { "Content-Type": "application/json" } : undefined,
        body:
          action === "upload-placeholder"
            ? JSON.stringify({
                filename: "portfolio-cover.png",
                mimeType: "image/png",
                sizeBytes: 1024
              })
            : undefined
      }
    );

    if (!response.ok) {
      setMessage(`Action failed with HTTP ${response.status}`);
      return;
    }

    const data = (await response.json()) as { message: string; project: PortfolioProject };
    setMessage(data.message);
    setProject(data.project);
  }

  return (
    <div className="action-panel">
      <div className="actions">
        <button className="button" type="button" onClick={() => void postAction("upload-placeholder")}>
          Record upload placeholder
        </button>
        <button className="button secondary" type="button" onClick={() => void postAction("generate-profile")}>
          Generate local AI text
        </button>
      </div>

      {message ? <p className="success">{message}</p> : null}
      {project ? (
        <dl className="facts">
          <div>
            <dt>Image key</dt>
            <dd>{project.imageKey ?? "none"}</dd>
          </div>
          <div>
            <dt>AI text</dt>
            <dd>{project.aiProfileText ?? "none"}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
