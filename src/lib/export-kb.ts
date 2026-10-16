import { articles, domains } from "@/lib/kb";

function download(filename: string, mime: string, text: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadKnowledgeMarkdown() {
  const lines: string[] = [
    "# Telephone agent knowledge base",
    "",
    "Voice only. The live tool is the fact. This file is what the agent may do with that fact. Caller memory is never a source of truth.",
    "",
  ];
  for (const domain of domains) {
    lines.push(`## ${domain.name}`, "", domain.blurb, "");
    for (const article of articles.filter((item) => item.domain === domain.id)) {
      lines.push(`### ${article.title}`, "", article.summary, "", `**Source of truth.** ${article.tool}`, "", "**May**", "");
      for (const item of article.may) lines.push(`- ${item}`);
      lines.push("", "**Must not**", "");
      for (const item of article.mustNot) lines.push(`- ${item}`);
      lines.push("", "**Say this**", "");
      for (const item of article.say) lines.push(`- ${item}`);
      lines.push("");
      if (article.escalate) lines.push(`**Transfer.** ${article.escalate}`, "");
      for (const section of article.sections) {
        lines.push(`**${section.heading}**`, "");
        for (const line of section.body) lines.push(`- ${line}`);
        lines.push("");
      }
    }
  }
  download("telephone-agent-knowledge-base.md", "text/markdown", lines.join("\n"));
}

export function downloadKnowledgeJson() {
  download(
    "telephone-agent-knowledge-base.json",
    "application/json",
    JSON.stringify({ domains, articles }, null, 2),
  );
}
