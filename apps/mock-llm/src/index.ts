import cors from "cors";
import express from "express";
import helmet from "helmet";

const app = express();
const port = Number(process.env.MOCK_LLM_PORT ?? 4100);

app.use(helmet());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:8080"] }));
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "bts-sec-mock-llm",
    mode: "local-only"
  });
});

app.post("/v1/chat", (request, response) => {
  response.json({
    id: "mock-local-response-0001",
    model: "mock-llm-local-only",
    input: request.body ?? {},
    output: "This is a deterministic local mock response. No external AI service was called."
  });
});

app.listen(port, () => {
  console.log(`BTS_sec mock LLM listening on http://localhost:${port}`);
});

