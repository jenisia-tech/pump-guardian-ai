import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Client-side demo auth (no backend).                                 */
/* Demo credentials: admin / admin123                                  */
/* Accounts created via the sign-up form are stored locally.           */
/* ------------------------------------------------------------------ */

export interface SessionUser {
  name: string;
  role: string;
  email: string;
  initials: string;
}

const LS_KEY = "centriguard.session";
const SESSION_KEY = "centriguard.session.tmp";
const USERS_KEY = "centriguard.users";
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin123";

interface StoredUser {
  name: string;
  email: string;
  password: string;
  createdAt: number;
}

interface Session {
  user: SessionUser;
  remember: boolean;
  ts: number;
}

const DEMO_USER: SessionUser = {
  name: "Admin",
  role: "System Operator",
  email: "admin@centriguard.io",
  initials: "AD",
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase() || "CG";
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw) as StoredUser[];
  } catch {
    /* noop */
  }
  return [];
}

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

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Creates an account locally and signs the customer in. */
export async function signUp(
  name: string,
  email: string,
  password: string,
  remember = true,
): Promise<{ ok: boolean; error?: string }> {
  await delay(500); // simulate account provisioning
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (cleanName.length < 2) return { ok: false, error: "Please enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  const users = readUsers();
  if (users.some((u) => u.email === cleanEmail)) {
    return { ok: false, error: "An account with this email already exists. Sign in instead." };
  }
  users.push({ name: cleanName, email: cleanEmail, password, createdAt: Date.now() });
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* noop */
  }
  session = {
    user: { name: cleanName, role: "Customer", email: cleanEmail, initials: initialsOf(cleanName) },
    remember,
    ts: Date.now(),
  };
  persist(session);
  emit();
  return { ok: true };
}

/** Validates demo credentials or a stored account, then signs the user in. */
export async function signIn(
  username: string,
  password: string,
  remember = false,
): Promise<{ ok: boolean; error?: string }> {
  await delay(500); // simulate auth round-trip
  const clean = username.trim().toLowerCase();

  if (clean === VALID_USERNAME && password === VALID_PASSWORD) {
    session = { user: DEMO_USER, remember, ts: Date.now() };
    persist(session);
    emit();
    return { ok: true };
  }

  const match = readUsers().find(
    (u) => u.email === clean && u.password === password,
  );
  if (match) {
    session = {
      user: {
        name: match.name,
        role: "Customer",
        email: match.email,
        initials: initialsOf(match.name),
      },
      remember,
      ts: Date.now(),
    };
    persist(session);
    emit();
    return { ok: true };
  }

  return { ok: false, error: "Invalid username or password." };
}

/** Clears the current session. */
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
    signUp,
    signOut,
  };
}
