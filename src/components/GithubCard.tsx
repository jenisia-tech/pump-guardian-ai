import { motion } from "framer-motion";
import { Github as GithubIcon, Link2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useGithubActions } from "@/hooks/use-github";
import {
  convexEnabled,
  readGithubSettings,
  writeGithubSettings,
  type GithubSettings,
} from "@/lib/github-config";
import { collectSourceFiles } from "@/lib/source-manifest";
import { cn } from "@/lib/utils";

const BATCH = 25;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 py-4 last:border-0">
      {children}
    </div>
  );
}

export default function GithubCard() {
  const { check, pushProject } = useGithubActions();
  const [cfg, setCfg] = useState<GithubSettings>(() => readGithubSettings());
  const [busy, setBusy] = useState<"check" | "push" | null>(null);
  const [connected, setConnected] = useState<{ login: string; name: string | null } | null>(null);
  const [pushed, setPushed] = useState<{ total: number; failed: number } | null>(null);

  const save = (patch: Partial<GithubSettings>) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    writeGithubSettings(next);
  };

  const testConnection = async () => {
    setBusy("check");
    try {
      const res = await check();
      setConnected(res);
      toast.success(`GitHub connected as @${res.login}`);
    } catch (e) {
      setConnected(null);
      toast.error("GitHub connection failed", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBusy(null);
    }
  };

  const pushToGithub = async () => {
    const owner = cfg.owner.trim();
    const repo = cfg.repo.trim();
    if (!owner || !repo) {
      toast.error("Enter a repository owner and name first");
      return;
    }
    setBusy("push");
    try {
      const files = await collectSourceFiles();
      let total = 0;
      let failed = 0;
      for (const batch of chunk(files, BATCH)) {
        const res = await pushProject({
          owner,
          repo,
          branch: "main",
          message: "Deploy CentriGuard — app source",
          files: batch,
        });
        total += res.pushed;
        failed += res.failed;
      }
      setPushed({ total, failed });
      toast.success(`Pushed ${total} file${total === 1 ? "" : "s"} to ${owner}/${repo}`);
      if (failed > 0) {
        toast.warning(`${failed} file${failed === 1 ? "" : "s"} skipped — verify the repo and branch exist`);
      }
    } catch (e) {
      toast.error("Push failed", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="glass rounded-xl p-5 lg:col-span-2"
    >
      <h3 className="mb-1 flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
        <GithubIcon className="size-4 text-primary" /> GitHub integration
      </h3>
      <p className="text-[11.5px] text-muted-foreground">
        File alerts as issues and deploy this project's source to a repository through the GitHub REST
        API — the token stays on the backend, never in the browser.
      </p>

      {!convexEnabled && (
        <p className="mt-3 rounded-md border border-orange-500/25 bg-orange-500/10 px-3 py-2 text-[12px] text-orange-500">
          Backend connection unavailable — the <span className="numeric font-semibold">VITE_CONVEX_URL</span>{" "}
          environment variable is not set.
        </p>
      )}

      <Row>
        <div>
          <p className="text-[13px] font-medium text-foreground">Connection</p>
          <p className="text-[11px] text-muted-foreground">
            {connected
              ? `Authenticated as @${connected.login}${connected.name ? ` · ${connected.name}` : ""}`
              : pushed
                ? `Last push: ${pushed.total} files${pushed.failed ? `, ${pushed.failed} failed` : ""}`
                : "Verify the token configured in the Keys tab"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={testConnection}
          disabled={busy !== null || !convexEnabled}
          className="gap-1.5"
        >
          {busy === "check" ? (
            <span className="size-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          ) : (
            <Link2 className="size-3.5" />
          )}
          Test connection
        </Button>
      </Row>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="gh-owner" className="text-[12px] font-medium text-foreground">
            Owner / organization
          </label>
          <Input
            id="gh-owner"
            value={cfg.owner}
            onChange={(e) => save({ owner: e.target.value })}
            placeholder="jenisia-tech"
            className="h-9"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="gh-repo" className="text-[12px] font-medium text-foreground">
            Repository
          </label>
          <Input
            id="gh-repo"
            value={cfg.repo}
            onChange={(e) => save({ repo: e.target.value })}
            placeholder="brainbolt"
            className="h-9"
          />
        </div>
      </div>

      <Row>
        <div>
          <p className="text-[13px] font-medium text-foreground">Auto-file critical alerts</p>
          <p className="text-[11px] text-muted-foreground">
            Each new critical alarm is filed as a GitHub issue with its telemetry and recommendation
          </p>
        </div>
        <Switch
          checked={cfg.autoFile}
          onCheckedChange={(v) => {
            save({ autoFile: v });
            toast[v ? "success" : "info"](v ? "Critical alerts will be auto-filed to GitHub" : "Auto-file disabled");
          }}
        />
      </Row>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-foreground">Push project source</p>
          <p className="text-[11px] text-muted-foreground">
            Uploads the app's source files to <span className="numeric">{cfg.owner || "owner"}/{cfg.repo || "repo"}</span>{" "}
            on the <span className="numeric">main</span> branch — secrets and generated files are excluded
          </p>
        </div>
        <Button
          onClick={pushToGithub}
          disabled={busy !== null || !convexEnabled}
          className={cn("gap-1.5")}
        >
          {busy === "push" ? (
            <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Upload className="size-3.5" />
          )}
          {busy === "push" ? "Pushing…" : "Push to GitHub"}
        </Button>
      </div>
    </motion.div>
  );
}
