import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BellRing,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  FileDown,
  Gauge,
  ShieldCheck,
  Waves,
} from "lucide-react";
import { Link } from "react-router";

import { BrandMark, Wordmark } from "@/components/BrandMark";
import { ChartCard } from "@/components/ChartCard";
import { Gauge as GaugeVis } from "@/components/Gauge";
import { Button } from "@/components/ui/button";
import { C } from "@/lib/colors";
import { useHistory, useSimulation } from "@/lib/simulation";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Activity, title: "Vibration & temperature telemetry", desc: "Simulated accelerometer and RTD streams refreshed every second from a realistic sensor model." },
  { icon: BarChart3, title: "FFT feature extraction", desc: "BPFO, broadband RMS and spectral kurtosis computed on windowed 25.6 kS/s frames." },
  { icon: Boxes, title: "Interactive digital twin", desc: "Component-level replica of the pump — click any part to inspect its live condition." },
  { icon: BrainCircuit, title: "AI diagnostics", desc: "Ensemble ML models classify bearing and cavitation faults, quantify confidence, and project remaining useful life." },
  { icon: BellRing, title: "Alert engine", desc: "Threshold logic raises actionable alarms with severity, root cause and a recommended maintenance action." },
  { icon: FileDown, title: "Pump catalog & fleet", desc: "Browse CentriGuard-ready pump models, add them to your fleet, and track every unit from one dashboard." },
];

const STATS = [
  { value: "183", label: "Days avg. remaining useful life", sub: "healthy baseline" },
  { value: "96%", label: "Best efficiency point", sub: "ISO 10816-3 Zone A" },
  { value: "<1 yr", label: "Return on investment", sub: "preventive vs failure" },
  { value: "48 h", label: "Emergency shutdown window", sub: "critical bearing alarm" },
];

export default function Landing() {
  const s = useSimulation();
  const history = useHistory(60);
  const rmsData = history.map((h) => ({ t: h.t, v: h.rms }));

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="glow-blue pointer-events-none absolute inset-x-0 top-0 h-[560px]" />

      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="transition-opacity hover:opacity-80">
            <Wordmark size={30} sub="Predictive Maintenance" />
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] font-medium text-muted-foreground md:flex">
            <a href="#platform" className="transition-colors hover:text-foreground">Platform</a>
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#roi" className="transition-colors hover:text-foreground">ROI</a>
          </nav>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="gap-2">
              Sign in <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary"
          >
            <ShieldCheck className="size-3.5" />
            Digital twin · Simulated vibration & temperature
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.55 }}
            className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl"
          >
            Predict pump failure.
            <br />
            <span className="text-primary">Before it costs a shift.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.55 }}
            className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground"
          >
            CentriGuard is a software digital twin that analyzes simulated vibration
            and temperature data to predict failures in the centrifugal pumps of HVAC
            systems — bearing wear and cavitation flagged early, with remaining-useful-life
            projections and maintenance work-orders.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.55 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/auth">
              <Button size="lg" className="h-11 gap-2 px-6">
                Open control room <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/auth?returnTo=%2Fcatalog">
              <Button variant="outline" size="lg" className="h-11 px-6">
                Browse the catalog
              </Button>
            </Link>
            <Link to="/auth?returnTo=%2Fdocs">
              <Button variant="ghost" size="lg" className="h-11 px-6">
                Read documentation
              </Button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-8 flex items-center gap-2 text-[12px] text-muted-foreground"
          >
            <CheckCircle2 className="size-4 text-green-500" />
            Demo access — no setup required · admin / admin123 · or create an account
          </motion.div>
        </div>

        {/* live demo card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-primary/10 blur-3xl" />
          <div className="glass relative rounded-2xl p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrandMark size={22} />
                <p className="text-[13px] font-semibold">CentriGuard console</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-green-500/25 bg-green-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-green-500">
                <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
                LIVE SIMULATION
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/50 bg-background/40 p-3 text-center">
                <GaugeVis value={s.bearingTemp} min={35} max={85} label="Bearing Temp" unit="°C" decimals={1} warnAt={70} critAt={60} size={132} />
              </div>
              <div className="rounded-xl border border-border/50 bg-background/40 p-3 text-center">
                <GaugeVis value={s.efficiency} min={40} max={100} label="Efficiency" unit="%" decimals={1} warnAt={80} critAt={70} size={132} />
              </div>
            </div>
            <div className="mt-4">
              <ChartCard
                title="Overall vibration RMS"
                subtitle="broadband · g"
                data={rmsData}
                color={C.blue}
                unit="g"
                decimals={2}
                height={120}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ["Speed", `${Math.round(s.motorSpeed)} rpm`],
                ["Flow", `${s.flowRate.toFixed(1)} m³/h`],
                ["Health", `${s.bearingHealth.toFixed(1)} %`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border/40 bg-background/30 py-2">
                  <p className="text-[9.5px] uppercase tracking-wider text-muted-foreground">{k}</p>
                  <p className="numeric text-[12.5px] font-semibold text-foreground">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* stats strip */}
      <section className="border-y border-border/50 bg-background/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {STATS.map((st, i) => (
            <motion.div
              key={st.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <p className="numeric text-2xl font-semibold tracking-tight text-foreground">{st.value}</p>
              <p className="mt-1 text-[12.5px] font-medium text-foreground">{st.label}</p>
              <p className="text-[11px] text-muted-foreground">{st.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl"
        >
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            <Gauge className="size-3.5" /> Platform capabilities
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">One console for the whole condition chain</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            From raw vibration to a dispatched work order — every layer of a real
            predictive-maintenance deployment, demonstrated end to end, plus a catalog
            of CentriGuard-ready pump models for your fleet.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="glass group rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
              >
                <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/8 text-primary transition-transform duration-300 group-hover:scale-105">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-[14.5px] font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* architecture strip */}
      <section id="platform" className="border-t border-border/50 bg-background/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
          >
            <Waves className="size-3.5" /> Signal path
          </motion.div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {["Sensors", "Signal conditioning", "Edge FFT", "Feature extraction", "Prediction engine", "Maintenance team"].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className={cn(
                  "rounded-lg border border-border/50 bg-background/40 px-3 py-4 text-center",
                  i === 4 && "border-primary/40 bg-primary/8",
                )}
              >
                <p className={cn("text-[12px] font-medium", i === 4 ? "text-primary" : "text-foreground")}>{step}</p>
                <p className="numeric mt-1 text-[10px] text-muted-foreground">#{i + 1}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="roi" className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="glass relative overflow-hidden rounded-2xl p-10 text-center sm:p-14"
        >
          <div className="glow-blue pointer-events-none absolute inset-0" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
            Watch a bearing fail. <span className="text-primary">On purpose.</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            Inject bearing wear, cavitation, or a combined failure from the simulation
            panel and watch the whole platform react — alerts, remaining useful life,
            and maintenance work-orders, just like a live deployment.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="h-11 gap-2 px-7">
                Launch the console <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/auth?returnTo=%2Fcatalog">
              <Button variant="outline" size="lg" className="h-11 px-7">
                Browse pump catalog
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Wordmark size={26} sub="" />
          <p className="text-[12px] text-muted-foreground">
            © {new Date().getFullYear()} CentriGuard · Software simulation — no physical sensors attached
          </p>
        </div>
      </footer>
    </div>
  );
}
