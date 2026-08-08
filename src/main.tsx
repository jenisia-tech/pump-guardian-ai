import "@vly-ai/integrations";
import { AnimatePresence, motion } from "framer-motion";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { BrandMark } from "@/components/BrandMark";
import { convexUrl } from "@/lib/github-config";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const LiveMonitoring = lazy(() => import("./pages/LiveMonitoring.tsx"));
const DigitalTwin = lazy(() => import("./pages/DigitalTwin.tsx"));
const Simulation = lazy(() => import("./pages/Simulation.tsx"));
const Diagnostics = lazy(() => import("./pages/Diagnostics.tsx"));
const Catalog = lazy(() => import("./pages/Catalog.tsx"));
const Alerts = lazy(() => import("./pages/Alerts.tsx"));
const Maintenance = lazy(() => import("./pages/Maintenance.tsx"));
const History = lazy(() => import("./pages/History.tsx"));
const Architecture = lazy(() => import("./pages/Architecture.tsx"));
const CostAnalysis = lazy(() => import("./pages/CostAnalysis.tsx"));
const Docs = lazy(() => import("./pages/Docs.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AppShell = lazy(() =>
  import("./components/AppShell").then((m) => ({ default: m.AppShell })),
);

/** Route-level loading state with the animated brand mark. */
function RouteLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <BrandMark size={44} className="pulse-soft" />
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 animate-bounce rounded-full bg-primary" />
        <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Initializing CentriGuard
      </p>
    </div>
  );
}

/** Short branded boot splash shown once on first load. */
function BootSplash() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <BrandMark size={64} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-center"
          >
            <p className="text-[15px] font-semibold tracking-tight text-foreground">
              Centri<span className="text-primary">Guard</span>
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Centrifugal Pump Analytics
            </p>
          </motion.div>
          <div className="h-0.5 w-40 overflow-hidden rounded-full bg-border">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
              className="h-full w-full bg-gradient-to-r from-blue-500 to-cyan-400"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

const convex = new ConvexReactClient(convexUrl || "https://placeholder.convex.cloud");

function AppProviders({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <AppProviders>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <BootSplash />
          <ToolbarErrorBoundary>
            <VlyToolbar />
          </ToolbarErrorBoundary>
          <BrowserRouter>
            <RouteSyncer />
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
                <Route
                  element={
                    <RequireAuth>
                      <AppShell />
                    </RequireAuth>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/live" element={<LiveMonitoring />} />
                  <Route path="/digital-twin" element={<DigitalTwin />} />
                  <Route path="/simulation" element={<Simulation />} />
                  <Route path="/diagnostics" element={<Diagnostics />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/architecture" element={<Architecture />} />
                  <Route path="/cost" element={<CostAnalysis />} />
                  <Route path="/docs" element={<Docs />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </AppProviders>
    </RootErrorBoundary>
  </React.StrictMode>,
);
