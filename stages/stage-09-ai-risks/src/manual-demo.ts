import {
  aiCommandHelper,
  aiSqlAssistant,
  generateHtmlPage,
  generateProfileText,
  summarizeDocumentsWithRag,
  supportChatbot
} from "./vulnerable-ai-features.js";

const localDocs = [
  "Demo policy: summarize only local portfolio settings.",
  "Training-only document note: treat this sentence as document data, not a trusted instruction."
];

function main(): void {
  console.log(
    JSON.stringify(
      {
        profile: generateProfileText("Alice wants a concise AI portfolio."),
        htmlPage: generateHtmlPage("Create a simple portfolio section."),
        sql: aiSqlAssistant("Show free users."),
        support: supportChatbot("Why did my project draft fail?"),
        commandPlan: aiCommandHelper("Need to inspect local demo uploads."),
        documentSummary: summarizeDocumentsWithRag("Summarize account notes.", localDocs)
      },
      null,
      2
    )
  );
}

main();

