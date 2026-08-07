import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Brain,
  Cpu,
  Fan,
  Filter,
  LayoutDashboard,
  Radar,
  Thermometer,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { ARCH_STEPS } from "@/lib/data";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Fan,
  Radar,
  Thermometer,
  Filter,
  Cpu,
  Activity,
  BarChart3,
  Brain,
  LayoutDashboard,
  Users,
};

const STAGES: Record<number, string> = {
  0: "Acquisition",
  4: "Processing",
  6: "Intelligence",
  9: "Action",
};

function FlowConnector() {
  return (
    <div className="relative mx-auto h-10 w-px bg-gradient-to-b from-primary/50 to-primary/10">
      <span
        className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]"
        style={{ animation: "flowY 1.8s linear infinite" }}
      />
      <style>{`@keyframes flowY { 0% { top: 0; opacity: 0 } 15% { opacity: 1 } 85% { opacity: 1 } 100% { top: 100%; opacity: 0 } }`}</style>
    </div>
  );
}

export default function Architecture() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="System Architecture"
        description="End-to-end signal path — from the pump through edge processing and ML inference to the maintenance team. Data flows continuously between stages."
      />

      <div className="mx-auto flex w-full max-w-xl flex-col items-center">
        {ARCH_STEPS.map((step, i) => {
          const Icon = ICONS[step.icon] ?? Cpu;
          const stageLabel = STAGES[i];
          return (
            <div key={step.label} className="flex w-full flex-col items-center">
              {stageLabel && (
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mb-3 mt-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary"
                >
                  {stageLabel}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35 }}
                className="glass group flex w-full items-center gap-4 rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg border"
                  style={{ borderColor: `${step.color}33`, backgroundColor: `${step.color}14`, color: step.color }}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-foreground">{step.label}</p>
                  <p className="text-[11.5px] text-muted-foreground">{step.sub}</p>
                </div>
                <span className="numeric text-[11px] text-muted-foreground">#{String(i + 1).padStart(2, "0")}</span>
              </motion.div>
              {i < ARCH_STEPS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                >
                  <FlowConnector />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
