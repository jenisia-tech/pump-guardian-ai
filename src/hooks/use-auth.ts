import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Client-side demo session (no backend).                              */
/* Demo credentials: admin / admin123                                  */
/* ------------------------------------------------------------------ */

export interface SessionUser {
  name: string;
  role: string;
  email: string;
  initials: string;
}

const LS_KEY = "pg.session";
const SESSION_KEY = "pg.session.tmp";
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin123";

interface Session {
  user: SessionUser;
  remember: boolean;
  ts: number;
}

const DEMO_USER: SessionUser = {
  name: "Admin",
  role: "System Operator",
  email: "admin@pumpguardian.ai",
  initials: "AD",
};

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(LS_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.user?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

let session: Session | null = readSession();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot(): Session | null {
  return session;
}

function persist(s: Session) {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    if (s.remember) {
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }
  } catch {
    /* storage unavailable — keep in-memory only */
  }
}

/** Validates demo credentials and signs the user in. */
export async function signIn(
  username: string,
  password: string,
  remember = false,
): Promise<{ ok: boolean; error?: string }> {
  await new Promise((r) => setTimeout(r, 500)); // simulate auth round-trip
  if (username.trim().toLowerCase() !== VALID_USERNAME || password !== VALID_PASSWORD) {
    return { ok: false, error: "Invalid username or password." };
  }
  session = { user: DEMO_USER, remember, ts: Date.now() };
  persist(session);
  emit();
  return { ok: true };
}

/** Clears the demo session. */
export async function signOut(): Promise<void> {
  session = null;
  try {
    localStorage.removeItem(LS_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
  emit();
}

export function useAuth() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    isLoading: false,
    isAuthenticated: current !== null,
    user: current?.user ?? null,
    signIn,
    signOut,
  };
}
