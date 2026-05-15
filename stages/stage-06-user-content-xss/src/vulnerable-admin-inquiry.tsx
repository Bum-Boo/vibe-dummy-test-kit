import type { Inquiry } from "./types.js";

type AdminInquiryProps = {
  inquiry: Inquiry;
};

export function AdminInquiryDetail({ inquiry }: AdminInquiryProps) {
  // Stage 06 intentionally vulnerable: admin pages are high-risk HTML sinks.
  // Submitted inquiry content is rendered as HTML instead of text.
  return (
    <main>
      <h1>Inquiry from {inquiry.email}</h1>
      <section dangerouslySetInnerHTML={{ __html: inquiry.messageHtml }} />
    </main>
  );
}

