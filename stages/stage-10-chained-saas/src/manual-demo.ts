import { resetDemoData } from "./demo-data.js";
import { handleRequest } from "./server.js";
import { createDemoUpload } from "./uploads.js";

async function main(): Promise<void> {
  process.chdir("stages/stage-10-chained-saas");
  resetDemoData();

  const aliceLogin = await handleRequest("POST", "/api/login", { userId: "alice" }, "alice");
  const bobLogin = await handleRequest("POST", "/api/login", { userId: "bob" }, "bob");
  const aliceProjects = await handleRequest("GET", "/api/projects", {}, "alice");
  const aliceReadsBobProject = await handleRequest("GET", "/api/projects/project-bob", {}, "alice");
  const uploadResult = await handleRequest(
    "POST",
    "/api/projects/project-alice/upload",
    {
      projectId: "project-alice",
      file: createDemoUpload(
        "chain-avatar.svg",
        "image/svg+xml",
        "<svg xmlns=\"http://www.w3.org/2000/svg\"><text x=\"4\" y=\"14\">chain demo</text></svg>"
      )
    },
    "alice"
  );
  const aiDescription = await handleRequest(
    "POST",
    "/api/projects/project-alice/ai-description",
    {
      projectId: "project-alice",
      prompt: "Alice builds local AI portfolio tools."
    },
    "alice"
  );
  const publicPortfolio = await handleRequest("GET", "/portfolio/alice-ai-portfolio", {}, "bob");
  const adminBypass = await handleRequest("POST", "/api/admin/dashboard", { isAdmin: true }, "alice");
  const exposedUser = await handleRequest("GET", "/api/users/alice", {}, "alice");

  console.log(
    JSON.stringify(
      {
        aliceLogin,
        bobLogin,
        aliceProjects,
        aliceReadsBobProject,
        uploadResult,
        aiDescription,
        publicPortfolio,
        adminBypass,
        exposedUser
      },
      null,
      2
    )
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

