/**
 * Client-side GitHub integration settings.
 *
 * The token itself never reaches the browser — it is read from
 * `process.env.GITHUB_TOKEN` inside Convex actions. This module only stores
 * which repository to target and user preferences, persisted in localStorage.
 */

export const convexUrl: string | undefined =
  (import.meta.env.VITE_CONVEX_URL as string | undefined) || undefined;

/** True when the Convex backend is connected (provider is mounted). */
export const convexEnabled = Boolean(convexUrl);

export interface GithubSettings {
  owner: string;
  repo: string;
  /** Auto-file new critical alerts as GitHub issues. */
  autoFile: boolean;
}

const KEY = "centriguard.github";

export const DEFAULT_GITHUB: GithubSettings = {
  owner: "jenisia-tech",
  repo: "brainbolt",
  autoFile: false,
};

export function readGithubSettings(): GithubSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_GITHUB, ...(JSON.parse(raw) as Partial<GithubSettings>) };
  } catch {
    /* noop */
  }
  return { ...DEFAULT_GITHUB };
}

export function writeGithubSettings(settings: GithubSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* noop */
  }
}
