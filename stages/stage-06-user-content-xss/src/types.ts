export type DemoUser = {
  id: "alice" | "bob";
  displayName: string;
  bio: string;
};

export type MarkdownPost = {
  id: string;
  title: string;
  markdown: string;
};

export type Inquiry = {
  id: string;
  email: string;
  messageHtml: string;
};

