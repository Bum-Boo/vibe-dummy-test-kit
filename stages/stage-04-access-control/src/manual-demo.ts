import { resetDemoData } from "./demo-data.js";
import { handleRequest } from "./server.js";

resetDemoData();

const aliceReadsBobProject = handleRequest("GET", "/api/projects/project-bob", "alice");
const aliceReadsOwnProjectsSafely = handleRequest("GET", "/api/my/projects", "alice");

console.log(
  JSON.stringify(
    {
      vulnerableRoute: {
        request: "GET /api/projects/project-bob as alice",
        result: aliceReadsBobProject
      },
      safeRoute: {
        request: "GET /api/my/projects as alice",
        result: aliceReadsOwnProjectsSafely
      }
    },
    null,
    2
  )
);

