import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useGithubActions } from "@/hooks/use-github";
import { convexEnabled, readGithubSettings } from "@/lib/github-config";
import { alertIssueBody, alertIssueTitle } from "@/lib/github-issues";
import { useAlerts } from "@/lib/simulation";

/**
 * Hidden watcher mounted inside the app shell. When the "auto-file critical
 * alerts" setting is on, every new critical alarm is filed as a GitHub issue.
 * Rendered only when the Convex backend is connected.
 */
export default function GithubAutoFile() {
  const alerts = useAlerts();
  const { createIssue } = useGithubActions();
  const filed = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!convexEnabled) return;
    const cfg = readGithubSettings();
    if (!cfg.autoFile || !cfg.owner.trim() || !cfg.repo.trim()) return;

    const due = alerts.filter((a) => a.severity === "critical" && !filed.current.has(a.id));
    if (due.length === 0) return;
    due.forEach((a) => filed.current.add(a.id));

    const owner = cfg.owner.trim();
    const repo = cfg.repo.trim();
    void (async () => {
      let filedCount = 0;
      let failed = 0;
      for (const a of due) {
        try {
          await createIssue({
            owner,
            repo,
            title: alertIssueTitle(a),
            body: alertIssueBody(a),
          });
          filedCount += 1;
        } catch {
          failed += 1;
        }
      }
      if (filedCount > 0) {
        toast.success(
          `Auto-filed ${filedCount} critical alert${filedCount === 1 ? "" : "s"} to ${owner}/${repo}`,
        );
      }
      if (failed > 0) {
        toast.error(
          `${failed} critical alert${failed === 1 ? "" : "s"} could not be auto-filed — check the token and repo`,
        );
      }
    })();
  }, [alerts, createIssue]);

  return null;
}
