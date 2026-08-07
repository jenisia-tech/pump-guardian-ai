import { useSyncExternalStore } from "react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SimMode = "healthy" | "bearing" | "cavitation" | "combined" | "shutdown";
export type Severity = "ok" | "info" | "warning" | "critical";
export type PumpStatus = "Running" | "Warning" | "Critical" | "Stopped";

export interface PumpState {
  mode: SimMode;
  status: PumpStatus;
  /** Bearing temperature °C */
  bearingTemp: number;
  /** Drive-end bearing vibration, g */
  bearingVibration: number;
  /** High-frequency vibration (cavitation band), g */
  hfVibration: number;
  /** Motor speed RPM */
  motorSpeed: number;
  /** Pump efficiency % */
  efficiency: number;
  /** BPFO peak amplitude g */
  bpfo: number;
  /** Cavitation RMS g */
  cavitationRms: number;
  /** Overall broadband RMS g */
  overallRms: number;
  /** Bearing health % */
  bearingHealth: number;
  /** Cavitation risk % */
  cavitationRisk: number;
  /** Remaining useful life, days */
  rul: number;
  /** Power draw kW */
  powerKw: number;
  /** Energy consumed today kWh */
  energyTodayKwh: number;
  /** Flow rate m³/h */
  flowRate: number;
  /** Discharge pressure bar */
  dischargePressure: number;
  /** Suction pressure bar */
  suctionPressure: number;
}

export interface HistoryPoint {
  t: number;
  temp: number;
  bvib: number;
  hvib: number;
  speed: number;
  eff: number;
  bpfo: number;
  cav: number;
  rms: number;
  health: number;
  risk: number;
}

export interface Alert {
  id: number;
  ts: number;
  severity: Severity;
  title: string;
  detail: string;
  recommendation?: string;
  source: string;
  read: boolean;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const noise = (amp: number) => (Math.random() * 2 - 1) * amp;

const HEALTHY: PumpState = {
  mode: "healthy",
  status: "Running",
  bearingTemp: 53,
  bearingVibration: 0.7,
  hfVibration: 0.42,
  motorSpeed: 2950,
  efficiency: 96,
  bpfo: 0.03,
  cavitationRms: 0.5,
  overallRms: 1.05,
  bearingHealth: 98,
  cavitationRisk: 2,
  rul: 183,
  powerKw: 18.6,
  energyTodayKwh: 42.7,
  flowRate: 62,
  dischargePressure: 6.2,
  suctionPressure: 2.4,
};

interface Targets {
  bearingTemp: number;
  bearingVibration: number;
  hfVibration: number;
  motorSpeed: number;
  efficiency: number;
  bpfo: number;
  cavitationRms: number;
  overallRms: number;
  bearingHealth: number;
  cavitationRisk: number;
  flowRate: number;
  dischargePressure: number;
  powerKw: number;
}

const MODE_TARGETS: Record<SimMode, Targets> = {
  healthy: {
    bearingTemp: 53,
    bearingVibration: 0.7,
    hfVibration: 0.42,
    motorSpeed: 2950,
    efficiency: 96,
    bpfo: 0.03,
    cavitationRms: 0.5,
    overallRms: 1.05,
    bearingHealth: 98,
    cavitationRisk: 2,
    flowRate: 62,
    dischargePressure: 6.2,
    powerKw: 18.6,
  },
  bearing: {
    bearingTemp: 75,
    bearingVibration: 2.6,
    hfVibration: 1.15,
    motorSpeed: 2948,
    efficiency: 92.5,
    bpfo: 0.17,
    cavitationRms: 0.55,
    overallRms: 2.9,
    bearingHealth: 55,
    cavitationRisk: 4,
    flowRate: 60,
    dischargePressure: 6.0,
    powerKw: 19.2,
  },
  cavitation: {
    bearingTemp: 54.5,
    bearingVibration: 4.6,
    hfVibration: 3.9,
    motorSpeed: 2945,
    efficiency: 76,
    bpfo: 0.035,
    cavitationRms: 4.2,
    overallRms: 5.1,
    bearingHealth: 96,
    cavitationRisk: 78,
    flowRate: 54,
    dischargePressure: 4.6,
    powerKw: 20.8,
  },
  combined: {
    bearingTemp: 76,
    bearingVibration: 4.8,
    hfVibration: 4.1,
    motorSpeed: 2940,
    efficiency: 71,
    bpfo: 0.18,
    cavitationRms: 4.4,
    overallRms: 5.6,
    bearingHealth: 42,
    cavitationRisk: 82,
    flowRate: 52,
    dischargePressure: 4.4,
    powerKw: 21.4,
  },
  shutdown: {
    bearingTemp: 58,
    bearingVibration: 0.05,
    hfVibration: 0.03,
    motorSpeed: 0,
    efficiency: 0,
    bpfo: 0.19,
    cavitationRms: 0.1,
    overallRms: 0.08,
    bearingHealth: 30,
    cavitationRisk: 52,
    flowRate: 0,
    dischargePressure: 0.2,
    powerKw: 0,
  },
};

export const MODE_LABEL: Record<SimMode, string> = {
  healthy: "Healthy Mode",
  bearing: "Bearing Failure",
  cavitation: "Cavitation",
  combined: "Combined Failure",
  shutdown: "Emergency Shutdown",
};

/* ------------------------------------------------------------------ */
/* RUL model                                                           */
/* ------------------------------------------------------------------ */

function computeRul(state: PumpState, mode: SimMode): number {
  if (mode === "shutdown") {
    return clamp(state.rul * 0.988 - 0.02, 0.4, 2);
  }
  if (mode === "healthy") {
    return clamp((state.bearingHealth - 20) * 2.1, 165, 200);
  }
  const base = Math.max(2, (state.bearingHealth - 20) * 2.1);
  const cavPenalty = state.cavitationRisk > 45 ? 0.52 : 1;
  return clamp(base * cavPenalty, 0.4, 200);
}

function computeStatus(mode: SimMode, health: number): PumpStatus {
  if (mode === "shutdown") return "Stopped";
  if (mode === "healthy") return "Running";
  if (mode === "bearing" || mode === "combined") {
    return health < 62 ? "Critical" : "Warning";
  }
  return "Warning";
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

const TICK_MS = 1000;
const HISTORY_LIMIT = 240;

interface ConditionSpec {
  key: string;
  test: (s: PumpState) => boolean;
  severity: Severity;
  title: string;
  detail: string;
  recommendation: string;
  source: string;
}

class SimStore {
  private listeners = new Set<() => void>();
  private state: PumpState = { ...HEALTHY };
  private history: HistoryPoint[] = [];
  private alerts: Alert[] = [];
  private activeConditions = new Set<string>();
  private nextAlertId = 1;
  private timer: ReturnType<typeof setInterval> | undefined;

  mode: SimMode = "healthy";
  speed = 1;
  notificationsEnabled = true;

  private conditions: ConditionSpec[] = [
    {
      key: "bvib-rise",
      test: (s) => s.bearingVibration > 1.15,
      severity: "warning",
      title: "Bearing vibration increasing",
      detail: "Drive-end bearing vibration has crossed the alert band (1.15 g).",
      recommendation: "Monitor BPFO trend; schedule vibration analysis.",
      source: "Accelerometer 1 · DE bearing",
    },
    {
      key: "bvib-critical",
      test: (s) => s.bearingVibration > 2.4,
      severity: "critical",
      title: "Bearing vibration critical",
      detail: "Vibration exceeds 2.4 g — severe bearing distress.",
      recommendation: "Inspect drive-end bearing; prepare for replacement.",
      source: "Accelerometer 1 · DE bearing",
    },
    {
      key: "temp-high",
      test: (s) => s.bearingTemp > 65,
      severity: "warning",
      title: "Bearing temperature above threshold",
      detail: "DE bearing temperature crossed 65 °C (limit).",
      recommendation: "Verify lubrication; check cooling water flow.",
      source: "RTD temperature sensor",
    },
    {
      key: "temp-critical",
      test: (s) => s.bearingTemp > 72,
      severity: "critical",
      title: "Temperature critical — thermal runaway risk",
      detail: "DE bearing temperature exceeded 72 °C.",
      recommendation: "Reduce load; prepare for planned shutdown.",
      source: "RTD temperature sensor",
    },
    {
      key: "bpfo-rise",
      test: (s) => s.bpfo > 0.07,
      severity: "warning",
      title: "BPFO peak rising",
      detail: "Ball-pass frequency outer-race amplitude trend is increasing.",
      recommendation: "Schedule detailed spectrum analysis.",
      source: "FFT feature extraction",
    },
    {
      key: "bpfo-high",
      test: (s) => s.bpfo > 0.13,
      severity: "critical",
      title: "BPFO elevated — bearing defect confirmed",
      detail: "Outer-race defect signature confirmed in spectrum.",
      recommendation: "Plan bearing replacement within 30 days.",
      source: "FFT feature extraction",
    },
    {
      key: "cavitation",
      test: (s) => s.cavitationRms > 2.2,
      severity: "warning",
      title: "Cavitation detected",
      detail: "High-frequency vibration band active — bubble collapse detected.",
      recommendation: "Check suction pressure; inspect strainers; raise NPSH margin.",
      source: "Accelerometer 2 · pump casing",
    },
    {
      key: "cavitation-critical",
      test: (s) => s.cavitationRms > 3.8,
      severity: "critical",
      title: "Severe cavitation — impeller damage risk",
      detail: "Cavitation RMS at severe level; efficiency collapsing.",
      recommendation: "Immediate suction-side inspection required.",
      source: "Accelerometer 2 · pump casing",
    },
    {
      key: "eff-low",
      test: (s) => s.efficiency < 84,
      severity: "warning",
      title: "Pump efficiency below threshold",
      detail: "Efficiency dropped below 84% (baseline 96%).",
      recommendation: "Review operating point; check for cavitation.",
      source: "Prediction engine",
    },
    {
      key: "eff-critical",
      test: (s) => s.efficiency < 74,
      severity: "critical",
      title: "Efficiency collapse",
      detail: "Performance curve deviation exceeds 20%.",
      recommendation: "Unload pump; perform full diagnostic.",
      source: "Prediction engine",
    },
    {
      key: "health-low",
      test: (s) => s.bearingHealth < 60,
      severity: "critical",
      title: "Bearing health critical",
      detail: "Remaining useful life below safe operating margin.",
      recommendation: "Schedule bearing replacement; monitor continuously.",
      source: "Prediction engine",
    },
  ];

  constructor() {
    // seed a short warm-up history so charts render immediately
    const t0 = Date.now() - 90 * TICK_MS;
    for (let i = 0; i < 90; i++) {
      this.pushHistory(t0 + i * TICK_MS, 0.4);
    }
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  /* ---------------- subscription ---------------- */

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  getSnapshot = () => this.state;
  getHistorySnapshot = () => this.history;
  getAlertsSnapshot = () => this.alerts;

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  /* ---------------- actions ---------------- */

  setMode(mode: SimMode) {
    if (mode === this.mode) return;
    this.mode = mode;
    this.activeConditions.clear();

    const specs: Record<SimMode, Omit<Alert, "id" | "ts" | "read">[]> = {
      healthy: [
        {
          severity: "ok",
          title: "System healthy",
          detail: "All vital signs within operating envelope.",
          recommendation: "Continue scheduled monitoring.",
          source: "Prediction engine",
        },
      ],
      bearing: [
        {
          severity: "warning",
          title: "Drive-end bearing wear developing",
          detail: "BPFO, temperature and RMS vibration trending upward.",
          recommendation: "Lubricate bearing · inspect alignment · schedule replacement.",
          source: "AI Diagnostics",
        },
      ],
      cavitation: [
        {
          severity: "warning",
          title: "Cavitation detected in pump",
          detail: "High-frequency vibration spikes with efficiency loss.",
          recommendation: "Check suction pressure · inspect strainers · adjust NPSH margin.",
          source: "AI Diagnostics",
        },
      ],
      combined: [
        {
          severity: "critical",
          title: "Combined bearing + cavitation fault",
          detail: "Two simultaneous degradation mechanisms detected.",
          recommendation: "Plan shutdown for combined maintenance window.",
          source: "AI Diagnostics",
        },
        {
          severity: "critical",
          title: "Multiple alarms active",
          detail: "Temperature, BPFO, cavitation RMS all beyond limits.",
          recommendation: "Priority inspection within 72 hours.",
          source: "Alert engine",
        },
      ],
      shutdown: [
        {
          severity: "critical",
          title: "Emergency shutdown required",
          detail: "Bearing health critically low — failure imminent.",
          recommendation: "Shutdown pump within 48 hours. Do not restart until inspection.",
          source: "Prediction engine",
        },
        {
          severity: "critical",
          title: "Pump stopped — emergency state",
          detail: "Motor tripped; asset isolated from chilled water loop.",
          recommendation: "Lock out / tag out; dispatch maintenance crew.",
          source: "SCADA link",
        },
      ],
    };

    specs[mode].forEach((s) => this.addAlert(s));

    if (this.notificationsEnabled) {
      if (mode === "shutdown") {
        toast.error("CRITICAL — Emergency shutdown required", {
          description: "Shutdown pump within 48 hours.",
          duration: 8000,
        });
      } else if (mode === "combined") {
        toast.error("Combined bearing + cavitation fault detected", {
          duration: 6000,
        });
      } else if (mode === "bearing" || mode === "cavitation") {
        toast.warning(`${MODE_LABEL[mode]} simulation active`, {
          description: "Fault signatures developing on monitored assets.",
          duration: 5000,
        });
      } else {
        toast.success("System returned to healthy baseline", { duration: 4000 });
      }
    }
  }

  reset() {
    this.mode = "healthy";
    this.activeConditions.clear();
    this.state = { ...HEALTHY, energyTodayKwh: this.state.energyTodayKwh };
    this.history = [];
    const t0 = Date.now() - 90 * TICK_MS;
    for (let i = 0; i < 90; i++) this.pushHistory(t0 + i * TICK_MS, 0.2);
    this.addAlert({
      severity: "ok",
      title: "Simulation reset",
      detail: "All values returned to healthy baseline. Alert log cleared.",
      recommendation: "Continue scheduled monitoring.",
      source: "Simulation panel",
    });
    if (this.notificationsEnabled) {
      toast.success("Simulation reset to healthy state", { duration: 4000 });
    }
    this.emit();
  }

  setSpeed(speed: number) {
    this.speed = clamp(speed, 0.5, 8);
    this.emit();
  }

  setNotificationsEnabled(v: boolean) {
    this.notificationsEnabled = v;
  }

  markAllAlertsRead() {
    this.alerts = this.alerts.map((a) => ({ ...a, read: true }));
    this.emit();
  }

  getAlerts() {
    return this.alerts;
  }

  /* ---------------- internals ---------------- */

  private addAlert(
    spec: Omit<Alert, "id" | "ts" | "read">,
    ts: number = Date.now(),
  ) {
    this.alerts = [
      { ...spec, id: this.nextAlertId++, ts, read: false },
      ...this.alerts,
    ].slice(0, 120);
    this.emit();
  }

  private pushHistory(t: number, jitter: number) {
    const s = this.state;
    this.history = [
      ...this.history,
      {
        t,
        temp: s.bearingTemp + noise(jitter),
        bvib: Math.max(0, s.bearingVibration + noise(jitter * 0.6)),
        hvib: Math.max(0, s.hfVibration + noise(jitter * 0.5)),
        speed: s.motorSpeed + noise(2),
        eff: clamp(s.efficiency + noise(jitter), 0, 100),
        bpfo: Math.max(0, s.bpfo + noise(jitter * 0.03)),
        cav: Math.max(0, s.cavitationRms + noise(jitter * 0.5)),
        rms: Math.max(0, s.overallRms + noise(jitter * 0.5)),
        health: clamp(s.bearingHealth + noise(jitter * 0.3), 0, 100),
        risk: clamp(s.cavitationRisk + noise(jitter * 0.5), 0, 100),
      },
    ].slice(-HISTORY_LIMIT);
  }

  private tick() {
    const targets = MODE_TARGETS[this.mode];
    const s = this.state;
    const k = Math.min(1, 0.055 * this.speed);

    const next: PumpState = {
      ...s,
      bearingTemp: s.bearingTemp + (targets.bearingTemp - s.bearingTemp) * k + noise(0.08),
      bearingVibration:
        Math.max(0, s.bearingVibration + (targets.bearingVibration - s.bearingVibration) * k + noise(0.02)),
      hfVibration:
        Math.max(0, s.hfVibration + (targets.hfVibration - s.hfVibration) * k + noise(0.02)),
      motorSpeed:
        this.mode === "shutdown"
          ? Math.max(0, s.motorSpeed + (0 - s.motorSpeed) * Math.min(1, 0.18 * this.speed))
          : s.motorSpeed + (targets.motorSpeed - s.motorSpeed) * k + noise(1.2),
      efficiency:
        s.efficiency + (targets.efficiency - s.efficiency) * k + noise(0.05),
      bpfo: Math.max(0, s.bpfo + (targets.bpfo - s.bpfo) * k + noise(0.001)),
      cavitationRms:
        Math.max(0, s.cavitationRms + (targets.cavitationRms - s.cavitationRms) * k + noise(0.03)),
      overallRms:
        Math.max(0, s.overallRms + (targets.overallRms - s.overallRms) * k + noise(0.02)),
      bearingHealth:
        this.mode === "shutdown"
          ? clamp(s.bearingHealth - 0.05 * this.speed, 8, 100)
          : clamp(s.bearingHealth + (targets.bearingHealth - s.bearingHealth) * k + noise(0.05), 5, 100),
      cavitationRisk:
        clamp(s.cavitationRisk + (targets.cavitationRisk - s.cavitationRisk) * k + noise(0.3), 0, 100),
      flowRate: Math.max(0, s.flowRate + (targets.flowRate - s.flowRate) * k + noise(0.15)),
      dischargePressure:
        Math.max(0, s.dischargePressure + (targets.dischargePressure - s.dischargePressure) * k + noise(0.01)),
      suctionPressure: clamp(2.4 + (2.0 - s.cavitationRisk / 90) * 0.2 + noise(0.02), 0.8, 2.6),
      powerKw: Math.max(0, s.powerKw + (targets.powerKw - s.powerKw) * k + noise(0.03)),
      energyTodayKwh: s.energyTodayKwh + (s.powerKw * this.speed) / 3600,
    };

    next.rul = computeRul(next, this.mode);
    next.status = computeStatus(this.mode, next.bearingHealth);

    this.state = next;
    this.pushHistory(Date.now(), 0.25);

    // evaluate threshold conditions
    for (const c of this.conditions) {
      const on = c.test(next);
      const wasOn = this.activeConditions.has(c.key);
      if (on && !wasOn) {
        this.activeConditions.add(c.key);
        this.addAlert({
          severity: c.severity,
          title: c.title,
          detail: c.detail,
          recommendation: c.recommendation,
          source: c.source,
        });
        if (this.notificationsEnabled && c.severity === "critical") {
          toast.error(c.title, { description: c.recommendation, duration: 6000 });
        } else if (this.notificationsEnabled && c.severity === "warning") {
          toast.warning(c.title, { description: c.recommendation, duration: 4500 });
        }
      } else if (!on && wasOn) {
        this.activeConditions.delete(c.key);
      }
    }

    this.emit();
  }
}

export const simulation = new SimStore();

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export function useSimulation(): PumpState {
  return useSyncExternalStore(simulation.subscribe, simulation.getSnapshot, simulation.getSnapshot);
}

export function useHistory(limit = HISTORY_LIMIT): HistoryPoint[] {
  const history = useSyncExternalStore(
    simulation.subscribe,
    simulation.getHistorySnapshot,
    simulation.getHistorySnapshot,
  );
  return history.slice(-limit);
}

export function useAlerts(): Alert[] {
  return useSyncExternalStore(
    simulation.subscribe,
    simulation.getAlertsSnapshot,
    simulation.getAlertsSnapshot,
  );
}

export function useSimMode() {
  return useSyncExternalStore(
    simulation.subscribe,
    () => simulation.mode,
    () => simulation.mode,
  );
}

/* ------------------------------------------------------------------ */
/* Seeded historical data (History page)                               */
/* ------------------------------------------------------------------ */

export type HistoryRange = "24h" | "7d" | "30d";

export interface TrendSeries {
  t: number;
  value: number;
}

export interface MaintenanceEvent {
  ts: number;
  action: string;
  detail: string;
  cost: string;
  downtime: string;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RANGES: Record<HistoryRange, { points: number; stepMs: number; seed: number }> = {
  "24h": { points: 24, stepMs: 3600_000, seed: 7 },
  "7d": { points: 28, stepMs: 6 * 3600_000, seed: 13 },
  "30d": { points: 30, stepMs: 24 * 3600_000, seed: 29 },
};

function makeTrend(
  rnd: () => number,
  base: number,
  drift: number,
  amp: number,
  count: number,
  stepMs: number,
): TrendSeries[] {
  const out: TrendSeries[] = [];
  let v = base;
  const tEnd = Date.now();
  for (let i = 0; i < count; i++) {
    v += (rnd() - 0.5) * drift + (rnd() - 0.5) * amp;
    v = Math.max(0, v);
    out.push({ t: tEnd - (count - 1 - i) * stepMs, value: v });
  }
  return out;
}

interface SeedCache {
  temp: TrendSeries[];
  health: TrendSeries[];
  vibration: TrendSeries[];
  alerts: Alert[];
  maintenance: MaintenanceEvent[];
}

const seedCache: Partial<Record<HistoryRange, SeedCache>> = {};

export function getSeedHistory(range: HistoryRange): SeedCache {
  if (seedCache[range]) return seedCache[range]!;
  const { points, stepMs, seed } = RANGES[range];
  const rnd = mulberry32(seed);
  const now = Date.now();

  const temp = makeTrend(rnd, 52.8, 0.22, 0.9, points, stepMs);
  const health = makeTrend(rnd, 99.1, -0.35, 0.4, points, stepMs).map((p) => ({
    t: p.t,
    value: Math.max(0, Math.min(100, p.value)),
  }));
  const vibration = makeTrend(rnd, 0.62, 0.03, 0.14, points, stepMs).map((p) => ({
    t: p.t,
    value: Math.max(0.1, p.value),
  }));

  const alertSamples: Array<
    [number, Severity, string, string]
  > = [
    [0.08, "ok", "System healthy", "All vitals within envelope"],
    [0.22, "info", "Scheduled maintenance completed", "Bearing re-lubricated; alignment verified"],
    [0.31, "warning", "Bearing vibration increasing", "Brief load transient — returned to normal"],
    [0.46, "ok", "Vibration settled", "Transient resolved; no action required"],
    [0.6, "warning", "BPFO trend rising", "Minor outer-race wear detected"],
    [0.74, "info", "Oil analysis sampled", "Viscosity nominal; no metal particles"],
    [0.88, "ok", "All clear", "No active alarms"],
  ];
  const alerts: Alert[] = alertSamples.map(([frac, severity, title, detail], i) => ({
    id: i + 1,
    ts: now - (1 - frac) * points * stepMs,
    severity,
    title,
    detail,
    source: "History archive",
    read: true,
  }));

  const maintenance: MaintenanceEvent[] = [
    {
      ts: now - 0.2 * points * stepMs,
      action: "Preventive maintenance",
      detail: "Grease DE & NDE bearings; torque check on coupling bolts.",
      cost: "₹4,800",
      downtime: "3 h",
    },
    {
      ts: now - 0.48 * points * stepMs,
      action: "Impeller inspection",
      detail: "Visual + ultrasonic check for pitting (none found).",
      cost: "₹6,200",
      downtime: "5 h",
    },
    {
      ts: now - 0.72 * points * stepMs,
      action: "Vibration survey",
      detail: "Baseline spectrum recorded; ISO 10816 grade A.",
      cost: "₹3,100",
      downtime: "1 h",
    },
  ];

  const cache: SeedCache = { temp, health, vibration, alerts, maintenance };
  seedCache[range] = cache;
  return cache;
}
