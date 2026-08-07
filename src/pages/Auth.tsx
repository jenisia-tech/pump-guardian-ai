import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye, EyeOff, KeyRound, Lock, ShieldCheck, User } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import { Wordmark } from "@/components/BrandMark";
import { PumpIllustration } from "@/components/PumpIllustration";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { signIn, useAuth } from "@/hooks/use-auth";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    if (isAuthenticated) navigate(redirect, { replace: true });
  }, [isAuthenticated, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { ok, error: err } = await signIn(username, password, remember);
    setLoading(false);
    if (ok) {
      toast.success("Signed in to control room", {
        description: `Redirecting to ${redirect === "/dashboard" ? "Dashboard" : redirect}`,
      });
      navigate(redirect, { replace: true });
    } else {
      setError(err ?? "Invalid credentials.");
      setShake((s) => s + 1);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-background text-foreground">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />

      {/* ---------- Left: illustration panel ---------- */}
      <div className="relative hidden w-[52%] flex-col justify-between overflow-hidden border-r border-border/60 bg-[#0a1122] p-10 lg:flex">
        <div className="glow-blue pointer-events-none absolute inset-0" />
        <div className="glow-cyan pointer-events-none absolute inset-x-0 bottom-0 h-1/2" />

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Wordmark size={34} sub="Predictive Maintenance Platform" />
        </motion.div>

        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="w-full max-w-lg"
          >
            <PumpIllustration className="w-full" />
          </motion.div>

          {/* floating telemetry chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {[
              { label: "Bearing Temp", value: "53.2 °C", tone: "text-green-400" },
              { label: "BPFO", value: "0.03 g", tone: "text-sky-400" },
              { label: "RMS", value: "1.05 g", tone: "text-cyan-300" },
              { label: "Speed", value: "2950 rpm", tone: "text-blue-400" },
            ].map((chip, i) => (
              <motion.div
                key={chip.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
                className="glass flex items-center gap-2 rounded-lg px-3 py-2"
              >
                <span className="size-1.5 rounded-full bg-cyan-400" />
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{chip.label}</span>
                <span className={`numeric text-[12px] font-semibold ${chip.tone}`}>{chip.value}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="max-w-md text-[13px] leading-relaxed text-muted-foreground"
        >
          Monitor motor bearing health and cavitation using simulated industrial
          sensor data — FFT feature extraction, RUL prediction, and maintenance
          work-order automation for a 30 HP chilled-water pump.
        </motion.p>
      </div>

      {/* ---------- Right: form panel ---------- */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center lg:hidden"
              aria-label="Back to landing"
            >
              <Wordmark size={32} />
            </button>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Control Room Access</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sign in to your console</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Enter operator credentials to open the monitoring suite.
              </p>
            </div>

            <AnimatePresence>
              <motion.form
                key={shake}
                onSubmit={handleSubmit}
                initial={{ x: 0 }}
                animate={shake > 0 ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="username" className="text-[12px] font-medium text-foreground">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      autoComplete="username"
                      className="h-10 pl-9"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-[12px] font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-10 pl-9 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-muted-foreground">
                    <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info("Contact your plant administrator to reset credentials.")}
                    className="text-[12.5px] font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-500"
                  >
                    {error} Use admin / admin123.
                  </motion.p>
                )}

                <Button type="submit" size="lg" disabled={loading} className="h-11 w-full text-[14px] font-semibold">
                  {loading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Authenticating…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-4" />
                      Login to Dashboard
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </motion.form>
            </AnimatePresence>

            <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <KeyRound className="size-3.5" /> Demo credentials
              </p>
              <p className="numeric mt-1 text-[12.5px] text-muted-foreground">
                username: <span className="font-semibold text-foreground">admin</span> · password:{" "}
                <span className="font-semibold text-foreground">admin123</span>
              </p>
            </div>

            <p className="text-center text-[12px] text-muted-foreground">
              Simulated industrial telemetry · No physical sensors attached
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
