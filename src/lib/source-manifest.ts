/**
 * Bundles the project's source files (as raw strings) so they can be pushed
 * to a GitHub repository via the contents API — no git CLI required.
 *
 * Uses lazy `import.meta.glob` with `?raw` so the source text is only loaded
 * when the user actually triggers a push.
 */

// NOTE: import.meta.glob only accepts inline string literals — the patterns
// must stay inline here (Vite rejects variable references with
// "Invalid glob import syntax: Could only use literals").
const lazy = import.meta.glob(
  [
    // project root files
    "../../package.json",
    "../../index.html",
    "../../vite.config.ts",
    "../../tsconfig.json",
    "../../tsconfig.app.json",
    "../../tsconfig.node.json",
    "../../components.json",
    "../../integrations.md",
    "../../README.md",
    // public assets
    "../../public/manifest.webmanifest",
    // everything under src (source of truth for the app)
    "../**/*.{ts,tsx,css,json}",
  ],
  { query: "?raw", import: "default" },
);

/** Paths that should never be uploaded (secrets / generated / vendor). */
function isExcluded(clean: string): boolean {
  if (clean.startsWith("node_modules")) return true;
  if (clean.includes("_generated")) return true; // Convex codegen output
  if (clean.endsWith(".env")) return true;
  return false;
}

function normalize(rel: string): string {
  // Strip the "../" prefixes used to reach the project root from src/lib.
  return rel.replace(/^\.\.\/\.\.\//, "").replace(/^\.\.\//, "");
}

export interface SourceFile {
  path: string;
  content: string;
}

export async function collectSourceFiles(): Promise<SourceFile[]> {
  const files: SourceFile[] = [];
  for (const [rel, load] of Object.entries(lazy)) {
    const clean = normalize(rel);
    if (isExcluded(clean)) continue;
    files.push({ path: clean, content: (await load()) as string });
  }
  files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}
