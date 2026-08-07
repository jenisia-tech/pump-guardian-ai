import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BatteryCharging,
  Boxes,
  Gauge as GaugeIcon,
  HeartPulse,
  Hourglass,
  Play,
  Square,
  Thermometer,
  Waves,
  Zap,
} from "lucide-react";
import { Link } from "react-router";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { ProgressRing } from "@/components/ProgressRing";
import { Gauge } from "@/components/Gauge";
import { SeverityBadge, SeverityDot } from "@/components/SeverityBadge";
import { Sparkline } from "@/components/Sparkline";
import { Button } from "@/components/ui/button";
import { C } from "@/lib/colors";
import { fmt, relativeTime } from "@/lib/format";
import { useFleet } from "@/lib/fleet";
import {
  useAlerts,
  useHistory,
  useSimulation,
  MODE_LABEL,
} from "@/lib/simulation";
import { cn } from "@/lib/utils";

function KpiCard({
  label,
  sub,
  value,
  unit,
  icon: Icon,
  tone,
  decimals = 1,
  spark,
  delay,
}: {
  label: string;
  sub: string;
  value: number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "blue" | "cyan" | "green" | "orange" | "red" | "slate";
  decimals?: number;
  spark?: number[];
  delay: number;
}) {
  const tones = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    slate: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  }[tone];
  const sparkColor = {
    blue: C.blue,
    cyan: C.cyan,
    green: C.green,
    orange: C.orange,
    red: C.red,
    slate: C.slate,
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="glass group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex size-9 items-center justify-center rounded-lg border", tones)}>
          <Icon className="size-4.5" />
        </div>
        {spark && spark.length > 1 && (
          <Sparkline data={spark} color={sparkColor} width={72} height={30} />
        )}
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <AnimatedNumber
          value={value}
          decimals={decimals}
          suffix={unit ? ` ${unit}` : ""}
          className="text-[22px] font-semibold tracking-tight text-foreground"
        />
      </div>
      <p className="mt-1 truncate text-[11px] text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const s = useSimulation();
  const alerts = useAlerts();
  const history = useHistory(60);
  const fleet = useFleet();

  const vibData = history.map((h) => ({ t: h.t, v: h.rms }));
  const tempData = history.map((h) => ({ t: h.t, v: h.temp }));
  const healthData = history.map((h) => ({ t: h.t, v: h.health }));
  const riskData = history.map((h) => ({ t: h.t, v: h.risk }));
  const speedData = history.map((h) => ({ t: h.t, v: h.speed }));
  const effData = history.map((h) => ({ t: h.t, v: h.eff }));
  const energyData = history.map((h) => ({ t: h.t, v: s.energyTodayKwh }));

  const statusTone =
    s.status === "Running"
      ? { text: "text-green-500", dot: "bg-green-500", ring: "border-green-500/25" }
      : s.status === "Stopped"
        ? { text: "text-red-500", dot: "bg-red-500", ring: "border-red-500/30" }
        : s.status === "Critical"
          ? { text: "text-red-500", dot: "bg-red-500", ring: "border-red-500/30" }
          : { text: "text-orange-500", dot: "bg-orange-500", ring: "border-orange-500/25" };

  const unreadCritical = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fleet Overview"
        description="Your monitored pumps · CHW-02 30 HP chilled-water unit showing live simulated telemetry"
        actions={
          <Link to="/simulation">
            <Button variant="outline" size="sm">
              <Square className="size-3.5" /> Simulation panel
            </Button>
          </Link>
        }
      />

      {/* my fleet strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04, duration: 0.35 }}
        className="glass flex flex-wrap items-center gap-3 rounded-xl px-4 py-3"
      >
        <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/8 text-primary">
          <Boxes className="size-4.5" />
        </div>
        <div className="mr-1">
          <p className="text-[13px] font-semibold text-foreground">My fleet</p>
          <p className="text-[11px] text-muted-foreground">{fleet.length} monitored unit{fleet.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {fleet.map((p) => (
            <Link
              key={p.id}
              to={p.active ? "/digital-twin" : "/catalog"}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-medium transition-all duration-200",
                p.active
                  ? "border-green-500/30 bg-green-500/8 text-green-500 hover:border-green-500/60"
                  : "border-border/60 text-muted-foreground hover:border-white/25 hover:text-foreground",
              )}
            >
              {p.active && <span className="size-1.5 animate-pulse rounded-full bg-green-500" />}
              <span className="numeric">{p.model}</span>
              <span className="hidden sm:inline">· {p.hp} HP</span>
            </Link>
          ))}
        </div>
        <Link to="/catalog" className="text-[12px] font-medium text-primary hover:underline">
          Browse catalog
        </Link>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02, duration: 0.35 }}
          className={cn("glass flex flex-col justify-between rounded-xl border p-4 transition-colors", statusTone.ring)}
        >
          <div className="flex items-center gap-2">
            <span className={cn("relative flex size-2", s.status === "Running" && "animate-pulse")}>
              {s.status !== "Running" && (
                <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-70", statusTone.dot)} />
              )}
              <span className={cn("relative inline-flex size-2 rounded-full", statusTone.dot)} />
            </span>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Pump Status</p>
          </div>
          <div>
            <p className={cn("text-[20px] font-semibold tracking-tight", statusTone.text)}>{s.status}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{MODE_LABEL[s.mode]}</p>
          </div>
        </motion.div>

        <KpiCard label="Bearing Health" sub="DE bearing · 6311" value={s.bearingHealth} unit="%" icon={HeartPulse} tone={s.bearingHealth > 70 ? "green" : s.bearingHealth > 45 ? "orange" : "red"} decimals={1} spark={healthData.map((d) => d.v)} delay={0.06} />
        <KpiCard label="Cavitation Risk" sub="Suction-side signature" value={s.cavitationRisk} unit="%" icon={Waves} tone={s.cavitationRisk > 60 ? "red" : s.cavitationRisk > 25 ? "orange" : "cyan"} decimals={0} spark={riskData.map((d) => d.v)} delay={0.1} />
        <KpiCard label="Remaining Useful Life" sub="Predicted days to failure" value={s.rul} unit="days" icon={Hourglass} tone={s.rul > 90 ? "green" : s.rul > 20 ? "orange" : "red"} decimals={1} spark={healthData.map((d) => d.v)} delay={0.14} />
        <KpiCard label="Motor Temperature" sub="DE bearing · RTD" value={s.bearingTemp} unit="°C" icon={Thermometer} tone={s.bearingTemp > 72 ? "red" : s.bearingTemp > 65 ? "orange" : "blue"} decimals={1} spark={tempData.map((d) => d.v)} delay={0.18} />
        <KpiCard label="Motor Speed" sub="Rated 2950 RPM" value={s.motorSpeed} unit="rpm" icon={GaugeIcon} tone={s.motorSpeed > 100 ? "cyan" : "slate"} decimals={0} spark={speedData.map((d) => d.v)} delay={0.22} />
        <KpiCard label="Pump Efficiency" sub="Best efficiency 96%" value={s.efficiency} unit="%" icon={Zap} tone={s.efficiency > 88 ? "green" : s.efficiency > 78 ? "orange" : "red"} decimals={1} spark={effData.map((d) => d.v)} delay={0.26} />
        <KpiCard label="Energy Consumption" sub="Today · kWh" value={s.energyTodayKwh} unit="kWh" icon={BatteryCharging} tone="blue" decimals={1} spark={energyData.map((d) => d.v)} delay={0.3} />
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <ChartCard
            title="Overall Vibration RMS"
            subtitle="Broadband · ISO 10816-3 baseline 1.05 g"
            data={vibData}
            color={s.status === "Running" ? C.blue : C.red}
            unit="g"
            decimals={2}
            height={150}
            className="sm:col-span-2"
          />
          <ChartCard
            title="Bearing Temperature"
            subtitle="RTD · healthy band 50–55 °C"
            data={tempData}
            color={C.orange}
            unit="°C"
            decimals={1}
            height={150}
            domain={[40, 85]}
          />
          <ChartCard
            title="BPFO Peak"
            subtitle="Outer-race defect frequency · healthy ≈ 0.03 g"
            data={history.map((h) => ({ t: h.t, v: h.bpfo }))}
            color={C.cyan}
            unit="g"
            decimals={3}
            height={150}
          />
        </div>

        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="glass flex flex-col items-center rounded-xl p-4"
          >
            <Gauge
              value={s.bearingTemp}
              min={35}
              max={85}
              label="Motor Bearing Temperature"
              unit="°C"
              decimals={1}
              warnAt={70}
              critAt={60}
              size={172}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.4 }}
            className="glass flex flex-col items-center rounded-xl p-4"
          >
            <Gauge
              value={s.efficiency}
              min={40}
              max={100}
              label="Pump Efficiency"
              unit="%"
              decimals={1}
              warnAt={80}
              critAt={70}
              size={172}
            />
          </motion.div>
        </div>
      </div>

      {/* bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="glass flex flex-col items-center justify-center gap-4 rounded-xl p-6"
        >
          <ProgressRing value={s.bearingHealth} size={148} stroke={10}>
            <div className="text-center">
              <AnimatedNumber value={s.bearingHealth} decimals={1} suffix="%" className="text-2xl font-semibold text-foreground" />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Health</p>
            </div>
          </ProgressRing>
          <div className="grid w-full grid-cols-3 gap-2 text-center">
            <div>
              <p className="numeric text-sm font-semibold text-foreground">{fmt(s.motorSpeed, 0)}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">RPM</p>
            </div>
            <div>
              <p className="numeric text-sm font-semibold text-foreground">{fmt(s.flowRate, 1)}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">m³/h</p>
            </div>
            <div>
              <p className="numeric text-sm font-semibold text-foreground">{fmt(s.dischargePressure, 2)}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">bar</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.4 }}
          className="glass flex flex-col rounded-xl p-5 lg:col-span-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-orange-500" />
              <h3 className="text-[13px] font-medium">Latest alerts</h3>
              {unreadCritical > 0 && (
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-500">
                  {unreadCritical} critical
                </span>
              )}
            </div>
            <Link to="/alerts" className="flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-border/50">
            {alerts.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2.5">
                <SeverityDot severity={a.severity} />
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-[13px]", a.read ? "text-muted-foreground" : "font-medium text-foreground")}>
                    {a.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{a.source}</p>
                </div>
                <SeverityBadge severity={a.severity} />
                <span className="numeric hidden text-[11px] text-muted-foreground sm:block">{relativeTime(a.ts)}</span>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No alerts — all clear</p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-2 pb-2 text-[11px] text-muted-foreground">
        <Play className="size-3" />
        Live simulated telemetry · updates every second · {history.length} samples buffered
      </div>
    </div>
  );
}
