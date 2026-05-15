import type { DemoUser, Inquiry } from "./types.js";

type SafeUserBioProps = {
  user: DemoUser;
};

type SafeInquiryProps = {
  inquiry: Inquiry;
};

export function SafeUserBioText({ user }: SafeUserBioProps) {
  // Safe contrast: JSX text interpolation escapes user content by default.
  return (
    <section>
      <h2>{user.displayName}</h2>
      <p>{user.bio}</p>
    </section>
  );
}

export function SafeInquiryMessage({ inquiry }: SafeInquiryProps) {
  return (
    <article>
      <h2>Inquiry from {inquiry.email}</h2>
      <p>{inquiry.messageHtml}</p>
    </article>
  );
}

