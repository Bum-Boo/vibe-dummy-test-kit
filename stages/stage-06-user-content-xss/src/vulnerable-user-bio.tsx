import type { DemoUser } from "./types.js";

type UserBioProps = {
  user: DemoUser;
};

export function UserBioCard({ user }: UserBioProps) {
  // Stage 06 intentionally vulnerable: user.bio is user-controlled HTML.
  return (
    <section>
      <h2>{user.displayName}</h2>
      <div dangerouslySetInnerHTML={{ __html: user.bio }} />
    </section>
  );
}

