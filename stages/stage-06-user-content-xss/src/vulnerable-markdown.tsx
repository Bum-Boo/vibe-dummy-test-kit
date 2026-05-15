import type { MarkdownPost } from "./types.js";

type MarkdownPreviewProps = {
  post: MarkdownPost;
};

const markdownOptions = {
  allowRawHtml: true,
  sanitize: false
};

export function MarkdownPreview({ post }: MarkdownPreviewProps) {
  // Stage 06 intentionally vulnerable: raw HTML is enabled and sanitization is disabled.
  const html = renderMarkdownAllowingRawHtml(post.markdown);

  return (
    <article>
      <h2>{post.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}

function renderMarkdownAllowingRawHtml(markdown: string): string {
  if (markdownOptions.allowRawHtml && markdownOptions.sanitize === false) {
    return markdown;
  }

  return escapeHtml(markdown);
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

