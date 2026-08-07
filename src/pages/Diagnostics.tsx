import { motion } from "framer-motion";
import { BrainCircuit, CheckCircle2, ChevronRight, Cpu, Lightbulb, ListChecks, Sparkles } from "lucide-react";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { ProgressRing } from "@/components/ProgressRing";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Badge } from "@/components/ui/badge";
import { C } from "@/lib/colors";
import { DIAGNOSTICS } from "@/lib/data";
import { useHistory, useSimulation } from "@/lib/simulation";

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <div className="mt-1 text-[15px] font-semibold text-foreground">{value}</div>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function Diagnostics() {
  const s = useSimulation();
  const history = useHistory(60);
  const diag = DIAGNOSTICS[s.mode];
  const faultTone =
    diag.severity === "ok"
      ? "border-green-500/25 bg-green-500/5"
      : diag.severity === "warning"
        ? "border-orange-500/25 bg-orange-500/5"
        : "border-red-500/30 bg-red-500/8";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI Diagnostics"
        description="Model output for the active simulation scenario — feature-level reasoning, prediction horizon, and work-order actions."
        actions={
          <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/5 py-1 text-primary">
            <BrainCircuit className="size-3.5" /> Inference on live window
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`glass flex flex-col gap-5 rounded-xl p-6 lg:col-span-2 ${faultTone}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" /> Detected fault
              </p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">{diag.fault}</h2>
            </div>
            <SeverityBadge severity={diag.severity} className="px-3 py-1 text-[12px]" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2 flex items-center gap-4 rounded-lg border border-border/50 bg-background/40 p-3 sm:col-span-1 sm:flex-col sm:justify-center sm:gap-1">
              <ProgressRing value={diag.confidence} size={72} stroke={7}>
                <AnimatedNumber value={diag.confidence} decimals={1} className="text-sm font-semibold" suffix="%" />
              </ProgressRing>
              <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground">Confidence</p>
            </div>
            <Stat label="Remaining useful life" value={`${diag.rul}`} />
            <Stat label="Severity" value={<span className={diag.severity === "critical" ? "text-red-500" : diag.severity === "warning" ? "text-orange-500" : "text-green-500"}>{diag.severity}</span>} />
            <Stat label="Model" value={diag.model} sub="Retrained weekly" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Root cause</p>
              <div className="flex flex-col gap-1.5">
                {diag.rootCause.map((rc) => (
                  <div key={rc} className="flex items-center gap-2 rounded-md border border-border/50 bg-background/40 px-3 py-2 text-[12.5px] text-foreground">
                    <ChevronRight className="size-3.5 shrink-0 text-primary" /> {rc}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Prediction</p>
              <div className="rounded-md border border-primary/25 bg-primary/5 px-3 py-2.5 text-[12.5px] leading-relaxed text-foreground">
                {diag.prediction}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Cpu className="size-3.5" /> Reasoning
            </p>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">{diag.reasoning}</p>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <ListChecks className="size-3.5" /> Recommended action
            </p>
            <div className="flex flex-col gap-1.5">
              {diag.action.map((a) => (
                <div key={a} className="flex items-center gap-2.5 rounded-md border border-green-500/20 bg-green-500/5 px-3 py-2 text-[12.5px] text-foreground">
                  <CheckCircle2 className="size-4 shrink-0 text-green-500" /> {a}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="glass flex items-start gap-3 rounded-xl p-5"
          >
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-400" />
            <div>
              <p className="text-[13px] font-semibold text-foreground">How to read this</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Confidence combines feature severity, trend consistency, and model agreement. A diagnosis is advisory —
                always confirm with a spectrum review before issuing a work order.
              </p>
            </div>
          </motion.div>
          <ChartCard
            title="Feature trends feeding the model"
            subtitle="Temperature vs BPFO over the last window"
            data={history.map((h) => ({ t: h.t, v: h.temp }))}
            color={C.orange}
            unit="°C"
            decimals={1}
            height={150}
          />
          <ChartCard
            title="Cavitation band energy"
            subtitle="High-frequency RMS · g"
            data={history.map((h) => ({ t: h.t, v: h.hvib }))}
            color={C.cyan}
            unit="g"
            decimals={2}
            height={150}
          />
        </div>
      </div>
    </div>
  );
}
