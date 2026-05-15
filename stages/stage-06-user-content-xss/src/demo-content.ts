import type { DemoUser, Inquiry, MarkdownPost } from "./types.js";

export const demoUser: DemoUser = {
  id: "alice",
  displayName: "Alice",
  bio: "<strong>Training bio:</strong> Alice likes AI portfolio design."
};

export const demoMarkdownPost: MarkdownPost = {
  id: "post-training",
  title: "AI Portfolio Draft",
  markdown: "## Draft\n\n<p>This raw HTML paragraph is harmless training content.</p>"
};

export const demoInquiry: Inquiry = {
  id: "inquiry-001",
  email: "student@example.test",
  messageHtml: "<p>Please review my portfolio formatting.</p><strong>Training content only.</strong>"
};

