import { dateTimeStr } from "@/lib/format";
import type { Alert } from "@/lib/simulation";

export function alertIssueTitle(a: Alert): string {
  return `[CentriGuard · ${a.severity.toUpperCase()}] ${a.title}`;
}

export function alertIssueBody(a: Alert): string {
  return [
    "Auto-filed from the CentriGuard predictive maintenance console.",
    "",
    `**Severity:** ${a.severity}`,
    `**Time:** ${dateTimeStr(a.ts)}`,
    `**Source:** ${a.source}`,
    "",
    a.detail,
    "",
    a.recommendation ? `**Recommended action:** ${a.recommendation}` : "",
    "",
    "---",
    "Asset CHW-02 · 30 HP centrifugal chilled-water pump",
  ]
    .filter(Boolean)
    .join("\n");
}
