import { motion } from "framer-motion";
import { Cog, MousePointerClick } from "lucide-react";
import { useState } from "react";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import { DigitalTwinSVG, TWIN_PART_LABEL, type TwinPartId } from "@/components/DigitalTwinSVG";
import { PageHeader } from "@/components/PageHeader";
import { ProgressRing } from "@/components/ProgressRing";
import { Badge } from "@/components/ui/badge";
import { fmt } from "@/lib/format";
import { useSimulation } from "@/lib/simulation";

function Row({ k, v, tone }: { k: string; v: React.ReactNode; tone?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-2 last:border-0">
      <span className="text-[12.5px] text-muted-foreground">{k}</span>
      <span className={`numeric text-[13px] font-medium ${tone ?? "text-foreground"}`}>{v}</span>
    </div>
  );
}

export default function DigitalTwin() {
  const s = useSimulation();
  const [selected, setSelected] = useState<TwinPartId>("bearing");

  const healthTone = s.bearingHealth > 70 ? "text-green-500" : s.bearingHealth > 45 ? "text-orange-500" : "text-red-500";
  const riskTone = s.cavitationRisk > 60 ? "text-red-500" : s.cavitationRisk > 25 ? "text-orange-500" : "text-cyan-400";
  const npshMargin = Math.max(0.4, 8.4 - s.cavitationRisk * 0.09).toFixed(1);

  const details: Record<TwinPartId, { rows: Array<[string, React.ReactNode, string?]>; blurb: string }> = {
    motor: {
      blurb: "30 HP (22 kW) three-phase induction motor coupled directly to the pump shaft.",
      rows: [
        ["Motor speed", `${fmt(s.motorSpeed, 0)} rpm`],
        ["Power draw", `${fmt(s.powerKw, 1)} kW`],
        ["Load", `${fmt((s.powerKw / 22) * 100, 1)} %`],
        ["Status", <span key="st" className={s.status === "Running" ? "text-green-500" : "text-red-500"}>{s.status}</span>],
        ["Rated voltage", "415 V · 3-ph"],
      ],
    },
    bearing: {
      blurb: "Drive-end 6311 deep-groove ball bearing — the most failure-prone component in the assembly.",
      rows: [
        ["Bearing temperature", `${fmt(s.bearingTemp, 1)} °C`, s.bearingTemp > 65 ? "text-orange-500" : "text-green-500"],
        ["Bearing vibration", `${fmt(s.bearingVibration, 2)} g`, s.bearingVibration > 2.4 ? "text-red-500" : s.bearingVibration > 1.15 ? "text-orange-500" : "text-green-500"],
        ["Bearing health", <span key="h" className={healthTone}>{fmt(s.bearingHealth, 1)} %</span>],
        ["BPFO peak", `${fmt(s.bpfo, 3)} g`, s.bpfo > 0.13 ? "text-red-500" : "text-foreground"],
        ["RUL", <span key="r" className={healthTone}>{fmt(s.rul, 1)} days</span>],
      ],
    },
    shaft: {
      blurb: "Direct coupling transmits motor torque to the impeller; misalignment accelerates bearing wear.",
      rows: [
        ["Shaft speed", `${fmt(s.motorSpeed, 0)} rpm`],
        ["Coupling type", "Spacer · elastomeric"],
        ["Alignment", s.status === "Running" ? <span key="al" className="text-green-500">Nominal · 0.04 mm</span> : <span key="al2" className="text-orange-500">Deviation detected</span>],
        ["Flow rate", `${fmt(s.flowRate, 1)} m³/h`],
        ["Power transmitted", `${fmt(s.powerKw, 1)} kW`],
      ],
    },
    casing: {
      blurb: "Volute casing converts kinetic energy into pressure head. Watch suction pressure for NPSH margin.",
      rows: [
        ["Discharge pressure", `${fmt(s.dischargePressure, 2)} bar`, s.dischargePressure < 5 ? "text-orange-500" : "text-foreground"],
        ["Suction pressure", `${fmt(s.suctionPressure, 2)} bar`, s.suctionPressure < 1.4 ? "text-orange-500" : "text-foreground"],
        ["NPSH margin", `${npshMargin} m`, s.cavitationRisk > 45 ? "text-orange-500" : "text-green-500"],
        ["Flow rate", `${fmt(s.flowRate, 1)} m³/h`],
        ["Head", `${fmt(48 * (s.flowRate / 62), 1)} m`],
      ],
    },
    impeller: {
      blurb: "Closed impeller, 6 vanes. Cavitation collapses bubbles against the vanes, pitting the metal surface.",
      rows: [
        ["Cavitation RMS", `${fmt(s.cavitationRms, 2)} g`, s.cavitationRms > 3.8 ? "text-red-500" : s.cavitationRms > 2.2 ? "text-orange-500" : "text-foreground"],
        ["Cavitation risk", <span key="cr" className={riskTone}>{fmt(s.cavitationRisk, 0)} %</span>],
        ["HF vibration", `${fmt(s.hfVibration, 2)} g`, s.hfVibration > 2 ? "text-orange-500" : "text-foreground"],
        ["Pump efficiency", `${fmt(s.efficiency, 1)} %`, s.efficiency < 78 ? "text-orange-500" : "text-green-500"],
        ["Impeller status", s.cavitationRisk > 45 ? <span key="im" className="text-orange-500">Pitting risk</span> : <span key="im2" className="text-green-500">Nominal</span>],
      ],
    },
    suction: {
      blurb: "Suction line feeds water at 2.4 bar. Blockages or low header pressure pull the pump toward NPSHr.",
      rows: [
        ["Suction pressure", `${fmt(s.suctionPressure, 2)} bar`, s.suctionPressure < 1.4 ? "text-orange-500" : "text-foreground"],
        ["NPSH margin", `${npshMargin} m`, s.cavitationRisk > 45 ? "text-orange-500" : "text-green-500"],
        ["Flow rate", `${fmt(s.flowRate, 1)} m³/h`],
        ["Strainer", s.status === "Running" ? <span key="st2" className="text-green-500">Clear</span> : <span key="st3" className="text-orange-500">Check</span>],
        ["Line size", "DN80 · steel"],
      ],
    },
    discharge: {
      blurb: "Discharge line delivers chilled water to the loop at system pressure and flow.",
      rows: [
        ["Discharge pressure", `${fmt(s.dischargePressure, 2)} bar`],
        ["Flow rate", `${fmt(s.flowRate, 1)} m³/h`, s.flowRate < 55 ? "text-orange-500" : "text-foreground"],
        ["Line size", "DN80 · steel"],
        ["Valve position", s.status === "Running" ? "78 % open" : "Closed"],
        ["Check valve", <span key="cv" className="text-green-500">Operating</span>],
      ],
    },
  };

  const detail = details[selected];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Digital Twin"
        description="Interactive replica of CHW-02. Click any component to inspect its live condition."
        actions={
          <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/5 py-1 text-primary">
            <MousePointerClick className="size-3" /> Click components
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-xl p-4 sm:p-6 lg:col-span-2"
        >
          <DigitalTwinSVG
            selected={selected}
            onSelect={setSelected}
            flowRate={s.flowRate}
            running={s.status === "Running" || s.status === "Warning" || s.status === "Critical"}
            cavitationRisk={s.cavitationRisk}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4 }}
          className="glass flex flex-col gap-4 rounded-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
              <Cog className="size-5" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground">{TWIN_PART_LABEL[selected]}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Component inspector</p>
            </div>
          </div>

          <p className="text-[12.5px] leading-relaxed text-muted-foreground">{detail.blurb}</p>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            {detail.rows.map(([k, v, tone]) => (
              <Row key={String(k)} k={k} v={v} tone={tone} />
            ))}
          </div>

          {(selected === "bearing" || selected === "impeller") && (
            <div className="flex items-center gap-4 rounded-lg border border-border/50 p-3">
              {selected === "bearing" ? (
                <>
                  <ProgressRing value={s.bearingHealth} size={64} stroke={6}>
                    <AnimatedNumber value={s.bearingHealth} decimals={0} className="text-xs font-semibold" suffix="%" />
                  </ProgressRing>
                  <div>
                    <p className="text-[12px] font-medium text-foreground">Bearing health index</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {s.bearingHealth > 70
                        ? "Healthy — routine monitoring."
                        : s.bearingHealth > 45
                          ? "Deteriorating — plan intervention."
                          : "Critical — replacement required."}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <ProgressRing value={s.cavitationRisk} size={64} stroke={6}>
                    <AnimatedNumber value={s.cavitationRisk} decimals={0} className="text-xs font-semibold" suffix="%" />
                  </ProgressRing>
                  <div>
                    <p className="text-[12px] font-medium text-foreground">Cavitation risk index</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {s.cavitationRisk > 45
                        ? "Bubble collapse active — inspect suction side."
                        : "No cavitation signature detected."}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
