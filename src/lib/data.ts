import type { Severity } from "./simulation";

/* ------------------------------------------------------------------ */
/* Asset specification                                                 */
/* ------------------------------------------------------------------ */

export const ASSET = {
  name: "CHW-02 Centrifugal Pump",
  unit: "Pump House A · HVAC Chilled Water Loop",
  motor: "30 HP (22 kW) · 3-Phase Induction",
  speed: "2950 RPM",
  flow: "62 m³/h",
  head: "48 m",
  bearings: "6311 Deep-Groove Ball · DE & NDE",
  standard: "ISO 10816-3 · Zone B",
};

/* ------------------------------------------------------------------ */
/* Pump catalog (customer-facing)                                      */
/* ------------------------------------------------------------------ */

export interface CatalogItem {
  id: string;
  model: string;
  name: string;
  category: string;
  hp: number;
  kw: number;
  rpm: number;
  flow: number; // m³/h
  head: number; // m
  bearings: string;
  monitoring: "Core" | "Pro";
  price: string; // annual monitoring subscription
  blurb: string;
}

export const CATALOG: CatalogItem[] = [
  {
    id: "cg-30chw",
    model: "CG-30 CHW",
    name: "Chilled Water Duty Pump",
    category: "Chilled water",
    hp: 30,
    kw: 22,
    rpm: 2950,
    flow: 62,
    head: 48,
    bearings: "6311 DE/NDE",
    monitoring: "Pro",
    price: "₹1.3 L / yr",
    blurb: "The reference unit for the live digital twin — end-suction pump with full Pro telemetry, FFT features and RUL projection.",
  },
  {
    id: "cg-20chw",
    model: "CG-20 CHW",
    name: "Compact Chilled Water Pump",
    category: "Chilled water",
    hp: 20,
    kw: 15,
    rpm: 2900,
    flow: 45,
    head: 40,
    bearings: "6208 DE/NDE",
    monitoring: "Core",
    price: "₹0.9 L / yr",
    blurb: "Space-saving duty pump for secondary loops; Core telemetry covers vibration, temperature and BPFO trends.",
  },
  {
    id: "cg-50chw",
    model: "CG-50 CHW",
    name: "High-Capacity Chilled Water Pump",
    category: "Chilled water",
    hp: 50,
    kw: 37,
    rpm: 2950,
    flow: 110,
    head: 55,
    bearings: "6312 DE/NDE",
    monitoring: "Pro",
    price: "₹1.8 L / yr",
    blurb: "Primary-loop workhorse with twin accelerometers and cavitation-band analysis for peak-load plants.",
  },
  {
    id: "cg-75chw",
    model: "CG-75 CHW",
    name: "District Cooling Pump",
    category: "Condenser water",
    hp: 75,
    kw: 55,
    rpm: 2950,
    flow: 160,
    head: 62,
    bearings: "6316 DE/NDE",
    monitoring: "Pro",
    price: "₹2.4 L / yr",
    blurb: "High-flow condenser duty with extended spectral bandwidth for large cooling towers.",
  },
  {
    id: "cg-15chw",
    model: "CG-15 CHW",
    name: "Light-Duty Chilled Water Pump",
    category: "Chilled water",
    hp: 15,
    kw: 11,
    rpm: 2900,
    flow: 34,
    head: 35,
    bearings: "6207 DE/NDE",
    monitoring: "Core",
    price: "₹0.7 L / yr",
    blurb: "Small-footprint unit for air-handling risers; Core package tracks the two highest-risk failure modes.",
  },
  {
    id: "cg-40chw",
    model: "CG-40 CHW",
    name: "Midsize Chilled Water Pump",
    category: "Condenser water",
    hp: 40,
    kw: 30,
    rpm: 2950,
    flow: 85,
    head: 50,
    bearings: "6311 DE/NDE",
    monitoring: "Pro",
    price: "₹1.5 L / yr",
    blurb: "Balanced duty for plant rooms with mixed loads; Pro package adds efficiency tracking and ROI reporting.",
  },
  {
    id: "cg-100chw",
    model: "CG-100 CHW",
    name: "Main Plant Loop Pump",
    category: "Booster",
    hp: 100,
    kw: 75,
    rpm: 2950,
    flow: 220,
    head: 70,
    bearings: "6320 DE/NDE",
    monitoring: "Pro",
    price: "₹3.1 L / yr",
    blurb: "Flagship unit for central plants; dual RTD and triaxial sensing with predictive work-order dispatch.",
  },
  {
    id: "cg-05chw",
    model: "CG-05 CHW",
    name: "Small Booster Pump",
    category: "Booster",
    hp: 5,
    kw: 3.7,
    rpm: 2900,
    flow: 12,
    head: 24,
    bearings: "6205 DE/NDE",
    monitoring: "Core",
    price: "₹0.4 L / yr",
    blurb: "Entry-level unit for tenant boosters; Core telemetry keeps watch with minimal hardware.",
  },
];

export const CATALOG_CATEGORIES = [
  "All",
  "Chilled water",
  "Condenser water",
  "Booster",
];

export const SENSORS = [
  { id: "ACC-01", type: "Accelerometer 1", mount: "Drive-end bearing housing", axis: "Radial", range: "±50 g", band: "10 Hz – 10 kHz", sample: "25.6 kS/s" },
  { id: "ACC-02", type: "Accelerometer 2", mount: "Pump casing (suction side)", axis: "Triaxial", range: "±50 g", band: "1 Hz – 20 kHz", sample: "51.2 kS/s" },
  { id: "RTD-01", type: "RTD temperature sensor", mount: "DE bearing housing", axis: "—", range: "0 – 150 °C", band: "DC", sample: "1 S/s" },
  { id: "PWR-01", type: "Power transducer", mount: "Motor MCC", axis: "—", range: "0 – 45 kW", band: "DC – 1 kHz", sample: "1 S/s" },
  { id: "PT-01", type: "Pressure transmitters", mount: "Suction & discharge flanges", axis: "—", range: "0 – 10 bar", band: "DC", sample: "1 S/s" },
];

/* ------------------------------------------------------------------ */
/* Diagnostics templates                                               */
/* ------------------------------------------------------------------ */

export interface Diagnostic {
  fault: string;
  confidence: number;
  severity: Severity;
  rul: string;
  rootCause: string[];
  reasoning: string;
  prediction: string;
  action: string[];
  model: string;
}

export const DIAGNOSTICS: Record<string, Diagnostic> = {
  healthy: {
    fault: "No fault detected",
    confidence: 99.2,
    severity: "ok",
    rul: "183 days",
    rootCause: ["All features within healthy envelope"],
    reasoning:
      "BPFO, temperature, RMS vibration and high-frequency energy are all inside ISO 10816-3 Zone A/B. Feature drift is below 2σ.",
    prediction: "Next maintenance event expected outside the 180-day horizon.",
    action: ["Continue scheduled monitoring", "Maintain lubrication plan"],
    model: "Isolation Forest · v3.2",
  },
  bearing: {
    fault: "Drive-end bearing wear",
    confidence: 94,
    severity: "warning",
    rul: "18 days",
    rootCause: ["BPFO peak increasing", "Bearing temperature rising", "High RMS vibration"],
    reasoning:
      "BPFO sidebands at 1× and 2× with rising amplitude indicate outer-race defect progression. Temperature follows the friction increase, consistent with lubricant breakdown at the defect site.",
    prediction: "Bearing failure expected within 18 days at current progression rate.",
    action: ["Lubricate bearing", "Inspect shaft alignment", "Schedule replacement in next planned window"],
    model: "CNN feature extractor + Random Forest · v3.2",
  },
  cavitation: {
    fault: "Pump cavitation",
    confidence: 91,
    severity: "warning",
    rul: "9 days",
    rootCause: ["High-frequency vibration spikes", "Pump efficiency drop", "Suction pressure below NPSHr"],
    reasoning:
      "Broadband energy in the 3–8 kHz band with random amplitude modulation is the classic signature of cavitating bubble collapse. Efficiency loss tracks the vapour fraction in the impeller.",
    prediction: "Impeller pitting will reach repairable threshold within 9 days.",
    action: ["Check suction strainer", "Raise suction pressure / NPSH margin", "Inspect impeller for pitting"],
    model: "Spectral kurtosis + SVM · v3.2",
  },
  combined: {
    fault: "Combined bearing wear + cavitation",
    confidence: 96,
    severity: "critical",
    rul: "4 days",
    rootCause: ["BPFO elevation with cavitation RMS", "Thermal rise with efficiency collapse", "Two independent degradation paths"],
    reasoning:
      "Both fault signatures are present simultaneously and mutually accelerating. Bearing temperature and cavitation energy are degrading the shaft seal and impeller in parallel.",
    prediction: "Critical failure within 4 days unless the pump is unloaded.",
    action: ["Unload pump immediately", "Plan dual-scope maintenance window", "Prepare replacement spares"],
    model: "Multi-label classifier · v3.2",
  },
  shutdown: {
    fault: "Critical — emergency shutdown",
    confidence: 97.8,
    severity: "critical",
    rul: "1.2 days",
    rootCause: ["Bearing health below safe threshold", "Failure progression beyond intervention window"],
    reasoning:
      "Asset stopped by emergency sequence. Residual thermal mass confirms over-temperature at the DE bearing. Do not restart until teardown inspection.",
    prediction: "Catastrophic bearing seizure within 48 hours if restarted.",
    action: ["Shutdown pump within 48 hours", "Lock out / tag out", "Dispatch maintenance crew with replacement kit"],
    model: "Fusion ensemble · v3.2",
  },
};

/* ------------------------------------------------------------------ */
/* Maintenance procedures                                              */
/* ------------------------------------------------------------------ */

export interface MaintenanceCard {
  id: string;
  title: string;
  fault: string;
  priority: "High" | "Critical" | "Routine";
  severity: Severity;
  estimatedDowntime: string;
  estimatedCost: string;
  sections: Array<{ heading: string; items: string[] }>;
}

export const MAINTENANCE_CARDS: MaintenanceCard[] = [
  {
    id: "bearing",
    title: "Drive-End Bearing Replacement",
    fault: "Bearing wear · BPFO + temperature + RMS",
    priority: "High",
    severity: "warning",
    estimatedDowntime: "6 – 8 hours",
    estimatedCost: "₹16,000 (parts) + ₹9,500 (labour)",
    sections: [
      {
        heading: "Symptoms",
        items: [
          "BPFO peak rising above 0.07 g",
          "DE bearing temperature above 65 °C",
          "RMS vibration climbing beyond ISO Zone B",
          "Audible metallic noise at 1× BPFO",
        ],
      },
      {
        heading: "Possible cause",
        items: [
          "Lubricant degradation / over-greasing",
          "Shaft misalignment or soft foot",
          "Outer-race spall from fatigue",
        ],
      },
      {
        heading: "Maintenance procedure",
        items: [
          "Lock out / tag out; isolate electrical supply",
          "Drain coolant; decouple motor from pump",
          "Remove DE bearing housing; extract old bearing",
          "Inspect shaft journal and housing bore for fretting",
          "Check alignment with laser tool; re-shim as needed",
          "Install new 6311 bearing with correct clearance",
          "Re-couple, align to ≤ 0.05 mm, run-in at low speed",
        ],
      },
    ],
  },
  {
    id: "cavitation",
    title: "Cavitation Rectification",
    fault: "Cavitation · HF vibration + efficiency loss",
    priority: "High",
    severity: "warning",
    estimatedDowntime: "4 – 6 hours",
    estimatedCost: "₹65,000 – ₹1,00,000 (impeller)",
    sections: [
      {
        heading: "Symptoms",
        items: [
          "High-frequency vibration spikes (3 – 8 kHz)",
          "Pump efficiency dropping below 84%",
          "Suction pressure near NPSHr",
          "Gravel-like noise from pump casing",
        ],
      },
      {
        heading: "Possible cause",
        items: [
          "Blocked suction strainer / foot valve",
          "Excessive suction lift or low header pressure",
          "Operation far left of best efficiency point",
        ],
      },
      {
        heading: "Inspection steps",
        items: [
          "Verify suction gauge reading vs NPSHr curve",
          "Clean and inspect strainers and suction line",
          "Borescope impeller inlet for pitting",
          "Review operating point against duty curve",
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Cost analysis                                                       */
/* ------------------------------------------------------------------ */

export const COST_KPIS = [
  { label: "Monitoring cost (annual)", value: "₹1.3 Lakhs", note: "Sensors + edge compute + software", color: "#3b82f6" },
  { label: "Unexpected failure cost", value: "₹4 – 8 Lakhs / hour", note: "Plant downtime during peak cooling", color: "#ef4444" },
  { label: "Bearing replacement", value: "₹16K", note: "Parts + labour, planned", color: "#f97316" },
  { label: "Motor replacement", value: "₹4 Lakhs", note: "Catastrophic failure scenario", color: "#ef4444" },
  { label: "Impeller replacement", value: "₹65K – ₹1L", note: "Cavitation damage", color: "#f97316" },
  { label: "Repair cost (avg incident)", value: "₹2.5L – ₹3.4L", note: "Unplanned repair scope", color: "#f97316" },
  { label: "Return on investment", value: "< 1 Year", note: "Payback from avoided failures", color: "#22c55e" },
];

export const COST_BARS = [
  { month: "Jan", preventive: 0.32, failure: 2.1 },
  { month: "Feb", preventive: 0.28, failure: 1.4 },
  { month: "Mar", preventive: 0.9, failure: 0.6 },
  { month: "Apr", preventive: 0.34, failure: 2.8 },
  { month: "May", preventive: 1.4, failure: 0.4 },
  { month: "Jun", preventive: 0.42, failure: 3.2 },
  { month: "Jul", preventive: 1.1, failure: 0.5 },
  { month: "Aug", preventive: 0.38, failure: 2.2 },
  { month: "Sep", preventive: 0.9, failure: 0.5 },
  { month: "Oct", preventive: 0.3, failure: 1.8 },
  { month: "Nov", preventive: 1.2, failure: 0.4 },
  { month: "Dec", preventive: 0.44, failure: 2.6 },
];

export const ROI_LINE = [
  { month: 0, spend: 0, avoided: 0 },
  { month: 1, spend: 0.55, avoided: 0.8 },
  { month: 2, spend: 0.62, avoided: 1.9 },
  { month: 3, spend: 1.15, avoided: 3.1 },
  { month: 4, spend: 1.28, avoided: 4.6 },
  { month: 5, spend: 1.75, avoided: 6.2 },
  { month: 6, spend: 1.95, avoided: 8.1 },
  { month: 7, spend: 2.4, avoided: 10.3 },
  { month: 8, spend: 2.6, avoided: 12.6 },
  { month: 9, spend: 3.05, avoided: 15.2 },
  { month: 10, spend: 3.25, avoided: 17.9 },
  { month: 11, spend: 3.7, avoided: 20.8 },
  { month: 12, spend: 3.9, avoided: 23.6 },
];

/* ------------------------------------------------------------------ */
/* Architecture                                                        */
/* ------------------------------------------------------------------ */

export const ARCH_STEPS = [
  { icon: "Fan", label: "Centrifugal Pump", sub: "30 HP · 2950 RPM", color: "#3b82f6" },
  { icon: "Radar", label: "Accelerometer 1", sub: "DE bearing housing", color: "#06b6d4" },
  { icon: "Radar", label: "Accelerometer 2", sub: "Pump casing", color: "#06b6d4" },
  { icon: "Thermometer", label: "RTD Sensor", sub: "Bearing temperature", color: "#06b6d4" },
  { icon: "Filter", label: "Signal Conditioning", sub: "Anti-alias · gain", color: "#8b5cf6" },
  { icon: "Cpu", label: "Edge Processor", sub: "On-site gateway", color: "#8b5cf6" },
  { icon: "Activity", label: "FFT Processing", sub: "25.6 kS/s windowed", color: "#f97316" },
  { icon: "BarChart3", label: "Feature Extraction", sub: "BPFO · RMS · kurtosis", color: "#f97316" },
  { icon: "Brain", label: "Prediction Engine", sub: "Ensemble ML models", color: "#22c55e" },
  { icon: "LayoutDashboard", label: "Dashboard", sub: "Operator console", color: "#22c55e" },
  { icon: "Users", label: "Maintenance Team", sub: "Work order dispatch", color: "#94a3b8" },
];

/* ------------------------------------------------------------------ */
/* Documentation (accordion sections)                                  */
/* ------------------------------------------------------------------ */

export interface DocSection {
  id: string;
  title: string;
  icon: string;
  body: string[];
}

export const DOC_SECTIONS: DocSection[] = [
  {
    id: "overview",
    title: "Project Overview",
    icon: "Info",
    body: [
      "CentriGuard is a software digital twin that analyzes simulated vibration and temperature data to predict failures in the centrifugal pumps of HVAC chilled-water systems. It monitors a 30 HP (22 kW) pump at 2950 RPM — no physical hardware is connected.",
      "The platform demonstrates the complete condition-monitoring pipeline: sensor acquisition, signal conditioning, FFT/feature extraction, fault detection, remaining-useful-life prediction, alerting, and maintenance work-order recommendations.",
      "Fault signatures simulated: drive-end bearing wear (BPFO progression), cavitation (high-frequency vibration), combined failure, and emergency shutdown scenarios.",
    ],
  },
  {
    id: "failure-modes",
    title: "Failure Modes",
    icon: "AlertTriangle",
    body: [
      "Rolling-element bearings fail through spalling, brinelling, or lubricant breakdown. Early signatures appear in the vibration spectrum as sidebands around ball-pass frequencies (BPFO, BPM, BSF) long before temperature rises.",
      "Cavitation occurs when local pressure drops below vapour pressure, causing bubbles to collapse against the impeller. It appears as broadband high-frequency energy (3–8 kHz) plus random amplitude modulation.",
      "Both modes reduce efficiency and raise energy consumption. Combined failure accelerates wear through vibration coupling and thermal stress.",
    ],
  },
  {
    id: "motor-bearing",
    title: "Motor Bearing Failure",
    icon: "Cog",
    body: [
      "The drive-end (DE) bearing carries the highest radial load. The monitor tracks temperature (healthy 50–55 °C), vibration (0.5–1.0 g), and the BPFO peak (healthy ≈ 0.03 g).",
      "Progression: BPFO amplitude rises first, followed by RMS vibration, then temperature. Health index degrades from 98% toward critical as RUL shrinks.",
      "Recommended response: lubricate, verify alignment, and schedule replacement before the 48-hour emergency window.",
    ],
  },
  {
    id: "cavitation",
    title: "Cavitation",
    icon: "Waves",
    body: [
      "Suction-side pressure below the required NPSH causes vapour bubbles to form at the impeller inlet. Collapse produces shock waves that pit the impeller and erode seals.",
      "Signatures: high-frequency vibration spikes (4–5 g in the simulation), pump efficiency drop below 84%, and elevated cavitation RMS.",
      "Mitigation: clean strainers, raise suction pressure, move the operating point toward the best efficiency point.",
    ],
  },
  {
    id: "sensors",
    title: "Sensor Selection",
    icon: "Sensors",
    body: [
      "Accelerometer 1 (DE bearing, radial, 10 Hz – 10 kHz): captures bearing defect frequencies. Accelerometer 2 (pump casing, triaxial, up to 20 kHz): captures cavitation broadband energy.",
      "RTD temperature sensor at the bearing housing tracks thermal progression. Power transducer at the MCC measures load and efficiency. Pressure transmitters at suction/discharge track NPSH margin.",
      "Sample rates of 25.6–51.2 kS/s with anti-aliased conditioning support the required frequency resolution at 2950 RPM.",
    ],
  },
  {
    id: "architecture",
    title: "System Architecture",
    icon: "Network",
    body: [
      "Sensors feed a signal-conditioning stage (anti-alias filtering, gain, isolation) then an edge processor that performs windowed FFT and feature extraction on-site.",
      "Features — BPFO peak, overall RMS, spectral kurtosis, high-frequency band energy — stream to the prediction engine, an ensemble of ML models trained on run-to-failure data.",
      "Outputs land on the operator dashboard; alerts trigger work orders for the maintenance team. The See System Architecture page for the live flow diagram.",
    ],
  },
  {
    id: "thresholds",
    title: "Threshold Logic",
    icon: "Gauge",
    body: [
      "Bearing temperature: warning > 65 °C, critical > 72 °C (healthy 50–55 °C).",
      "Bearing vibration: warning > 1.15 g, critical > 2.4 g (healthy 0.5–1.0 g).",
      "BPFO peak: warning > 0.07 g, critical > 0.13 g (healthy ≈ 0.03 g).",
      "Cavitation RMS: warning > 2.2 g, critical > 3.8 g (healthy ≈ 0.5 g).",
      "Efficiency: warning < 84%, critical < 74% (healthy ≈ 96%). Health index < 60% triggers critical bearing alarm.",
    ],
  },
  {
    id: "pilot",
    title: "Pilot Testing",
    icon: "FlaskConical",
    body: [
      "Phase 1 (weeks 1–2): baseline collection — verify spectrum features against the healthy envelope at all operating points.",
      "Phase 2 (weeks 3–6): supervised fault injection using the Simulation panel; validate alert latency and false-positive rate.",
      "Phase 3 (months 2–6): shadow mode — compare AI predictions against scheduled teardown findings; tune RUL confidence intervals.",
    ],
  },
  {
    id: "limitations",
    title: "Limitations",
    icon: "ShieldAlert",
    body: [
      "This deployment is a software simulation; no physical sensors are attached. Values are generated within realistic industrial ranges.",
      "RUL estimates carry statistical uncertainty — treat as advisory, not a guarantee. Model accuracy depends on representative run-to-failure training data.",
      "The platform monitors bearing and cavitation faults only; motor electrical faults, seal leaks, and structural resonance are out of scope for v1.",
    ],
  },
  {
    id: "future",
    title: "Future Improvements",
    icon: "Rocket",
    body: [
      "Multi-asset fleet view with anomaly scoring across all chilled water pumps.",
      "Motor-current signature analysis (MCSA) to detect electrical faults without extra sensors.",
      "Automated work-order integration with CMMS/ERP, and mobile push alerts for field crews.",
      "Digital-twin physics model fusion (pressure-flow curves) to refine RUL under load transients.",
    ],
  },
];
