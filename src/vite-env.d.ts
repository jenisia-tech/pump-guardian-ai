/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Convex deployment URL injected by the Freebuff platform. */
  readonly VITE_CONVEX_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
