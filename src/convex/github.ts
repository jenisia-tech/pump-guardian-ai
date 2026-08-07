"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * GitHub REST API integration for CentriGuard.
 *
 * All calls authenticate with `process.env.GITHUB_TOKEN` (set via the project
 * Keys tab) so the token never touches the browser. Network access requires
 * the "use node" runtime directive at the top of this file.
 */

const API = "https://api.github.com";

async function gh<T>(path: string, init?: RequestInit): Promise<{ status: number; data: T }> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured. Add it in the project Keys tab.");
  }
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "CentriGuard",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => null)) as T | null;
  if (!res.ok) {
    const msg = (data as { message?: string } | null)?.message ?? `GitHub API error ${res.status}`;
    throw new Error(msg);
  }
  return { status: res.status, data: data as T };
}

/** Verify the configured token and return the authenticated user. */
export const check = action({
  args: {},
  handler: async () => {
    const { data } = await gh<{ login: string; name: string | null; html_url: string }>("/user");
    return { login: data.login, name: data.name, url: data.html_url };
  },
});

/** Create an issue on a repository. */
export const createIssue = action({
  args: {
    owner: v.string(),
    repo: v.string(),
    title: v.string(),
    body: v.optional(v.string()),
    labels: v.optional(v.array(v.string())),
  },
  handler: async (_ctx, args) => {
    const { data } = await gh<{ number: number; html_url: string; title: string }>(
      `/repos/${encodeURIComponent(args.owner)}/${encodeURIComponent(args.repo)}/issues`,
      {
        method: "POST",
        body: JSON.stringify({
          title: args.title,
          body: args.body ?? "",
          ...(args.labels?.length ? { labels: args.labels } : {}),
        }),
      },
    );
    return { number: data.number, url: data.html_url, title: data.title };
  },
});

/**
 * Write a batch of files into a repository via the contents API
 * (creates or updates each file, committing per file).
 */
export const pushProject = action({
  args: {
    owner: v.string(),
    repo: v.string(),
    branch: v.optional(v.string()),
    message: v.optional(v.string()),
    files: v.array(v.object({ path: v.string(), content: v.string() })),
  },
  handler: async (_ctx, args) => {
    const owner = encodeURIComponent(args.owner);
    const repo = encodeURIComponent(args.repo);
    const branch = args.branch ?? "main";
    const message = args.message ?? "Deploy CentriGuard — app source";

    const results: Array<{ path: string; ok: boolean }> = [];
    let failed = 0;

    for (const file of args.files) {
      const safe = file.path.replace(/^\/+/, "");
      if (!safe || safe.includes("..") || safe.includes("node_modules")) {
        results.push({ path: safe, ok: false });
        failed += 1;
        continue;
      }
      let sha: string | undefined;
      try {
        const existing = await gh<{ sha: string }>(
          `/repos/${owner}/${repo}/contents/${safe}?ref=${encodeURIComponent(branch)}`,
        );
        sha = existing.data.sha;
      } catch {
        sha = undefined; // file does not exist yet
      }
      try {
        await gh(`/repos/${owner}/${repo}/contents/${safe}`, {
          method: "PUT",
          body: JSON.stringify({
            message,
            content: Buffer.from(file.content, "utf8").toString("base64"),
            branch,
            ...(sha ? { sha } : {}),
          }),
        });
        results.push({ path: safe, ok: true });
      } catch {
        results.push({ path: safe, ok: false });
        failed += 1;
      }
    }

    return { pushed: results.filter((r) => r.ok).length, failed, files: results };
  },
});
