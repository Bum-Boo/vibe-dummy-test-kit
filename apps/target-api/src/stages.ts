export type StageSummary = {
  id: string;
  title: string;
  focus: string;
  status: "scaffold-only" | "planned" | "implemented";
};

export const stages: StageSummary[] = [
  {
    id: "stage-00-clean",
    title: "Clean baseline",
    focus: "Scanner control stage",
    status: "scaffold-only"
  },
  {
    id: "stage-01-secrets",
    title: "Secrets",
    focus: "Fake local secret handling mistakes",
    status: "planned"
  },
  {
    id: "stage-02-frontend-config",
    title: "Frontend config",
    focus: "Browser-visible configuration mistakes",
    status: "planned"
  },
  {
    id: "stage-03-auth",
    title: "Auth",
    focus: "Simple authentication mistakes",
    status: "planned"
  },
  {
    id: "stage-04-access-control",
    title: "Access control",
    focus: "Object-level authorization mistakes",
    status: "planned"
  },
  {
    id: "stage-05-api-data-exposure",
    title: "API data exposure",
    focus: "Overly broad API responses",
    status: "planned"
  },
  {
    id: "stage-06-user-content-xss",
    title: "User content XSS",
    focus: "Unsafe user content rendering",
    status: "planned"
  },
  {
    id: "stage-07-file-upload",
    title: "File upload",
    focus: "Upload and local object storage mistakes",
    status: "planned"
  },
  {
    id: "stage-08-server-misconfig",
    title: "Server misconfig",
    focus: "Local reverse proxy and header mistakes",
    status: "planned"
  },
  {
    id: "stage-09-ai-risks",
    title: "AI risks",
    focus: "Mock-LLM prompt and data handling mistakes",
    status: "planned"
  },
  {
    id: "stage-10-chained-saas",
    title: "Chained SaaS",
    focus: "Combined realistic local SaaS scenario",
    status: "planned"
  },
  {
    id: "stage-11-fixed",
    title: "Fixed examples",
    focus: "Fixed examples that preserve functionality",
    status: "planned"
  }
];
