import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bell,
  BookOpen,
  BrainCircuit,
  Boxes,
  History,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Network,
  Search,
  Settings,
  SlidersHorizontal,
  Sun,
  Wrench,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { simulation, useAlerts, useSimulation, MODE_LABEL } from "@/lib/simulation";
import { relativeTime } from "@/lib/format";
import { Wordmark } from "./BrandMark";
import { SeverityBadge } from "./SeverityBadge";

/* ------------------------------------------------------------------ */
/* Navigation model                                                    */
/* ------------------------------------------------------------------ */

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  key?: string;
}
interface NavSection {
  section: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    section: "Monitor",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, key: "d" },
      { path: "/live", label: "Live Monitoring", icon: Activity, key: "l" },
      { path: "/digital-twin", label: "Digital Twin", icon: Boxes, key: "t" },
      { path: "/simulation", label: "Simulation", icon: SlidersHorizontal, key: "s" },
      { path: "/diagnostics", label: "AI Diagnostics", icon: BrainCircuit, key: "i" },
    ],
  },
  {
    section: "Operations",
    items: [
      { path: "/alerts", label: "Alert Center", icon: Bell, key: "a" },
      { path: "/maintenance", label: "Maintenance", icon: Wrench, key: "m" },
      { path: "/history", label: "History", icon: History, key: "h" },
    ],
  },
  {
    section: "System",
    items: [
      { path: "/architecture", label: "System Architecture", icon: Network, key: "r" },
      { path: "/cost", label: "Cost Analysis", icon: IndianRupee, key: "c" },
      { path: "/docs", label: "Documentation", icon: BookOpen },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const FLAT_NAV = NAV.flatMap((s) => s.items);

function titleForPath(pathname: string) {
  return FLAT_NAV.find((n) => n.path === pathname)?.label ?? "Overview";
}

/* ------------------------------------------------------------------ */
/* Live clock                                                          */
/* ------------------------------------------------------------------ */

function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="hidden text-right md:block">
      <p className="numeric text-sm font-semibold leading-none text-foreground">
        {now.toLocaleTimeString("en-GB", { hour12: false })}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status pill                                                         */
/* ------------------------------------------------------------------ */

function StatusPill() {
  const s = useSimulation();
  const map = {
    Running: { dot: "bg-green-500", text: "text-green-500", ring: "border-green-500/25 bg-green-500/8" },
    Warning: { dot: "bg-orange-500", text: "text-orange-500", ring: "border-orange-500/25 bg-orange-500/8" },
    Critical: { dot: "bg-red-500", text: "text-red-500", ring: "border-red-500/30 bg-red-500/10" },
    Stopped: { dot: "bg-red-500", text: "text-red-500", ring: "border-red-500/30 bg-red-500/10" },
  }[s.status];
  return (
    <div className={cn("hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:inline-flex", map.ring, map.text)}>
      <span className={cn("size-1.5 animate-pulse rounded-full", map.dot)} />
      {s.status} · {MODE_LABEL[s.mode]}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar body (shared desktop / mobile)                              */
/* ------------------------------------------------------------------ */

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  const alerts = useAlerts();
  const navigate = useNavigate();
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border/60 px-5">
        <button
          onClick={() => navigate("/dashboard")}
          className="transition-opacity hover:opacity-80"
          aria-label="Go to dashboard"
        >
          <Wordmark size={30} />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-6 px-3 py-4">
          {NAV.map((section) => (
            <div key={section.section}>
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                {section.section}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isAlerts = item.path === "/alerts";
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span
                              layoutId="nav-active"
                              className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                            />
                          )}
                          <Icon className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                          <span className="flex-1">{item.label}</span>
                          {isAlerts && unread > 0 && (
                            <span className="numeric flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/15 px-1.5 text-[10px] font-semibold text-red-500">
                              {unread}
                            </span>
                          )}
                          {item.key && (
                            <Kbd className="hidden opacity-0 transition-opacity group-hover:opacity-100 lg:inline-flex">
                              {item.key.toUpperCase()}
                            </Kbd>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/15 text-[11px] font-semibold text-primary">
              {user?.initials ?? "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-foreground">{user?.name ?? "Operator"}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user?.role ?? "System Operator"}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    if (!q.trim()) return FLAT_NAV.slice(0, 6);
    const s = q.toLowerCase();
    return FLAT_NAV.filter((n) => n.label.toLowerCase().includes(s)).slice(0, 6);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative hidden w-full max-w-xs sm:block">
      <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={ref}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[0]) {
            navigate(matches[0].path);
            setOpen(false);
            setQ("");
            ref.current?.blur();
          }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search modules…"
        className="h-9 rounded-md border-border/70 bg-muted/40 pl-9 pr-12 text-[13px] placeholder:text-muted-foreground/70"
      />
      <Kbd className="absolute right-3 top-1/2 -translate-y-1/2">/</Kbd>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl"
          >
            {matches.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">No modules found</p>
            )}
            {matches.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.path}
                  onClick={() => {
                    navigate(m.path);
                    setOpen(false);
                    setQ("");
                    ref.current?.blur();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-accent"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  {m.label}
                  {m.key && <Kbd className="ml-auto">{m.key.toUpperCase()}</Kbd>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications bell                                                  */
/* ------------------------------------------------------------------ */

function NotificationsBell() {
  const alerts = useAlerts();
  const navigate = useNavigate();
  const unread = alerts.filter((a) => !a.read).length;
  const latest = alerts.slice(0, 6);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" aria-label="Notifications">
          <Bell className="size-4.5" />
          {unread > 0 && (
            <span className="numeric absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
          <p className="text-[13px] font-semibold text-foreground">Notifications</p>
          <button
            className="text-[11px] font-medium text-primary hover:underline"
            onClick={() => {
              simulation.markAllAlertsRead();
              toast.info("All notifications marked as read");
            }}
          >
            Mark all read
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-1">
          {latest.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">No notifications</p>
          )}
          {latest.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate("/alerts")}
              className="flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent"
            >
              <SeverityBadge severity={a.severity} className="mt-0.5 shrink-0" />
              <span className="min-w-0">
                <span className={cn("block truncate text-[12.5px]", a.read ? "text-muted-foreground" : "font-medium text-foreground")}>
                  {a.title}
                </span>
                <span className="block text-[11px] text-muted-foreground">{relativeTime(a.ts)}</span>
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate("/alerts")}
          className="w-full border-t border-border/60 px-3 py-2 text-center text-[12px] font-medium text-primary hover:bg-accent/50"
        >
          View alert center
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Shortcuts dialog                                                    */
/* ------------------------------------------------------------------ */

function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const shortcuts: Array<[string, string]> = [
    ["d", "Dashboard"],
    ["l", "Live Monitoring"],
    ["t", "Digital Twin"],
    ["s", "Simulation"],
    ["i", "AI Diagnostics"],
    ["a", "Alert Center"],
    ["m", "Maintenance"],
    ["h", "History"],
    ["r", "System Architecture"],
    ["c", "Cost Analysis"],
    ["/", "Focus search"],
    ["?", "Show shortcuts"],
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {shortcuts.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/50">
              <span className="text-[13px] text-foreground">{label}</span>
              <Kbd>{key.toUpperCase()}</Kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Topbar                                                              */
/* ------------------------------------------------------------------ */

function TopBar({ onMenu, onShortcuts }: { onMenu: () => void; onShortcuts: () => void }) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const s = useSimulation();
  const isDark = theme === "dark";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 px-4 backdrop-blur-md sm:px-6",
        s.mode === "shutdown"
          ? "bg-red-950/20"
          : "bg-background/75",
      )}
    >
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu className="size-5" />
      </Button>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
          {titleForPath(location.pathname)}
        </p>
        <p className="hidden text-[11px] text-muted-foreground sm:block">PumpGuardian AI · Control Room</p>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <SearchBox />
        <StatusPill />
        <div className="mx-1 hidden h-6 w-px bg-border/70 sm:block" />
        <LiveClock />
        <div className="mx-1 hidden h-6 w-px bg-border/70 sm:block" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onShortcuts}
          aria-label="Keyboard shortcuts"
          className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
        >
          <Kbd className="bg-transparent">?</Kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
          className="text-muted-foreground hover:text-foreground"
        >
          {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </Button>
        <NotificationsBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="p-0" aria-label="Profile">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/15 text-[11px] font-semibold text-primary">
                  {user?.initials ?? "AD"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="text-[13px] font-semibold text-foreground">{user?.name}</p>
              <p className="text-[11px] font-normal text-muted-foreground">{user?.role}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
              <Settings className="mr-2 size-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const s = useSimulation();

  // global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;
      if (e.key === "?") {
        setShortcutsOpen(true);
        return;
      }
      if (typing) return;
      if (e.key === "/") {
        e.preventDefault();
        const el = document.querySelector<HTMLInputElement>("input[placeholder*='Search']");
        el?.focus();
        return;
      }
      const item = FLAT_NAV.find((n) => n.key === e.key.toLowerCase());
      if (item && !e.metaKey && !e.ctrlKey && !e.altKey) {
        navigate(item.path);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <div
      className={cn(
        "relative flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-500",
        s.mode === "shutdown" && "bg-[#1a0b0f]",
      )}
    >
      {/* background grid */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-all duration-700",
          s.mode === "shutdown" ? "shadow-[inset_0_0_120px_rgba(239,68,68,0.16)]" : "shadow-[inset_0_0_120px_rgba(37,99,235,0.05)]",
        )}
      />

      {/* desktop sidebar */}
      <aside className="relative z-20 hidden w-60 shrink-0 border-r border-border/60 bg-sidebar/90 backdrop-blur-md lg:block">
        <SidebarBody />
      </aside>

      {/* mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarBody onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* main column */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setMobileOpen(true)} onShortcuts={() => setShortcutsOpen(true)} />

        {s.mode === "shutdown" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="flex items-center gap-2.5 border-b border-red-500/30 bg-red-500/10 px-4 py-2 sm:px-6"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
            </span>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-red-400">
              Emergency — shutdown pump within 48 hours
            </p>
            <X className="ml-auto hidden size-4 text-red-400/70 sm:block" />
          </motion.div>
        )}

        <main className="relative min-h-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}
