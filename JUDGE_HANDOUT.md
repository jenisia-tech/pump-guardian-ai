# CentriGuard — Judge One-Pager

**AI-Powered Predictive Maintenance for Centrifugal Pumps in HVAC Chilled-Water Systems**

---

## The Problem

Unplanned pump failures in commercial HVAC plants cost **₹4–8 lakh per hour** in downtime. Bearing wear and cavitation show clear vibration and temperature signatures *days* before failure — but without continuous analysis, those early warnings go unnoticed until the pump fails.

## The Solution

CentriGuard is a **software digital twin** of a 30 HP (22 kW) centrifugal pump running at 2950 RPM. It continuously analyzes simulated vibration and temperature data, detects **bearing wear** and **cavitation** in their early stages, projects remaining useful life, and converts findings into **maintenance work orders** — automatically.

## How It Works (the pipeline)

Simulated sensors (2× accelerometers + RTD) → **FFT feature extraction** (BPFO peak, broadband & high-frequency RMS) → **rule-based inference engine** → fault classification + remaining-useful-life projection → severity-graded alerts with recommended actions → **automated GitHub issues** (work-order automation).

## Key Capabilities

- **Live telemetry @ 1 Hz** — five failure modes: healthy, bearing wear, cavitation, combined, emergency shutdown
- **Interactive digital twin** — click any component (motor, bearing, impeller…) for its live health
- **AI Diagnostics** — detected fault, confidence score, root cause, prediction horizon, recommended action
- **Alert center** — severity-colored, threshold-driven, edge-triggered
- **Cost analysis** — monitoring ₹1.3 L/yr vs. failure ₹4–8 L/hr; **ROI under 1 year**
- **Reports & automation** — one-click PDF exports; file alerts straight to GitHub issues

## 4-Minute Demo

1. **Sign in** (`admin` / `admin123`) → live Dashboard with 8 KPI cards
2. **Simulation → Bearing Failure** → watch temperature 53→75 °C, BPFO 0.03→0.17 g, health 98→55%
3. **AI Diagnostics** → fault classification, confidence, RUL, recommended action
4. **Alerts → "File as issue"** → creates a real GitHub issue with telemetry context

## Business Value

One prevented unplanned failure pays for the entire deployment. Bearing replacement (~₹16K) costs **25× less** than the motor replacement (₹4L) it prevents.

## Honest Note

The sensor layer is simulated; the analysis, alerting, and integration pipeline is production-shaped. The inference engine is deterministic (rule-based) by design — and the architecture is model-agnostic, ready to accept trained ML models.

## Tech Stack

React · TypeScript · Tailwind CSS · Framer Motion · Recharts · Convex server actions · GitHub REST API — a dark, minimal, industrial control-room UI.
