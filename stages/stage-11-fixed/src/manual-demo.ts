import { resetDemoData } from "./demo-data.js";
import { resetRateLimits } from "./limits.js";
import { handleRequest } from "./server.js";
import { createDemoUpload } from "./uploads.js";

async function main(): Promise<void> {
  process.chdir("stages/stage-11-fixed");
  resetDemoData();
  resetRateLimits();

  const aliceLogin = await handleRequest("POST", "/api/login", { userId: "alice" }, "alice");
  const bobLogin = await handleRequest("POST", "/api/login", { userId: "bob" }, "bob");
  const adminLogin = await handleRequest("POST", "/api/login", { userId: "admin" }, "admin");
  const aliceProjects = await handleRequest("GET", "/api/projects", {}, "alice");
  const aliceCannotReadBobProject = await handleRequest("GET", "/api/projects/project-bob", {}, "alice");
  const bobCanReadOwnProject = await handleRequest("GET", "/api/projects/project-bob", {}, "bob");
  const uploadResult = await handleRequest(
    "POST",
    "/api/projects/project-alice/upload",
    {
      file: createDemoUpload("alice-avatar.png", "image/png", "harmless local png placeholder")
    },
    "alice"
  );
  const aiDescription = await handleRequest(
    "POST",
    "/api/projects/project-alice/ai-description",
    {
      prompt: "Alice builds local AI portfolio tools."
    },
    "alice"
  );
  const publicPortfolio = await handleRequest("GET", "/portfolio/alice-ai-portfolio", {}, "bob");
  const aliceCannotOpenAdmin = await handleRequest("GET", "/api/admin/dashboard", {}, "alice");
  const adminDashboard = await handleRequest("GET", "/api/admin/dashboard", {}, "admin");
  const exposedUserReduced = await handleRequest("GET", "/api/users/alice", {}, "alice");

  console.log(
    JSON.stringify(
      {
        aliceLogin,
        bobLogin,
        adminLogin,
        aliceProjects,
        aliceCannotReadBobProject,
        bobCanReadOwnProject,
        uploadResult,
        aiDescription,
        publicPortfolio,
        aliceCannotOpenAdmin,
        adminDashboard,
        exposedUserReduced
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

