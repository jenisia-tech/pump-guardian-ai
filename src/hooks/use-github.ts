import { useAction } from "convex/react";

import { api } from "@/convex/_generated/api";

/** Typed wrappers around the GitHub Convex actions. Only usable when the
 *  Convex provider is mounted (see `convexEnabled`). */
export function useGithubActions() {
  const check = useAction(api.github.check);
  const createIssue = useAction(api.github.createIssue);
  const pushProject = useAction(api.github.pushProject);
  return { check, createIssue, pushProject };
}
