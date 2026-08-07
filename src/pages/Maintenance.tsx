import { motion } from "framer-motion";
import { Download, Wrench } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MAINTENANCE_CARDS } from "@/lib/data";
import { dateTimeStr } from "@/lib/format";
import { buildPdf, downloadPdf } from "@/lib/pdf";
import { useSimulation } from "@/lib/simulation";
import { cn } from "@/lib/utils";

export default function Maintenance() {
  const s = useSimulation();
  const activeCards = s.mode === "bearing" || s.mode === "healthy" ? ["bearing"] : s.mode === "cavitation" ? ["cavitation"] : ["bearing", "cavitation"];

  const exportReport = () => {
    const cards = MAINTENANCE_CARDS.filter((c) => activeCards.includes(c.id));
    const sections = cards.map((c) => ({
      heading: c.title.toUpperCase(),
      lines: [
        { text: `Fault: ${c.fault}` },
        { text: `Priority: ${c.priority}  ·  Downtime: ${c.estimatedDowntime}  ·  Cost: ${c.estimatedCost}` },
        { text: " " },
        ...c.sections.flatMap((sec) => [
          { text: sec.heading, bold: true },
          ...sec.items.map((it) => ({ text: `•  ${it}` })),
          { text: " " },
        ]),
      ],
    }));
    const pdf = buildPdf(
      "CentriGuard — Maintenance Report",
      `Asset CHW-02 · Generated ${dateTimeStr(Date.now())} · Mode: ${s.mode}`,
      sections,
    );
    downloadPdf(`centriguard-maintenance-report-${Date.now()}.pdf`, pdf);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Maintenance"
        description="Ready-to-dispatch procedures for the faults this platform detects. The panel highlights the procedure matching the active simulation scenario."
        actions={
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="size-3.5" /> Export PDF
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {MAINTENANCE_CARDS.map((card, i) => {
          const isActive = activeCards.includes(card.id);
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={cn(
                "glass flex flex-col rounded-xl p-6 transition-all duration-300",
                isActive ? "border-primary/40 bg-primary/5" : "opacity-80",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-primary">
                    <Wrench className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">{card.title}</h3>
                    <p className="text-[11.5px] text-muted-foreground">{card.fault}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <SeverityBadge severity={card.severity} />
                  {isActive && (
                    <Badge className="border-primary/40 bg-primary/15 text-primary">Recommended now</Badge>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Priority</p>
                  <p className={cn("mt-0.5 text-[13px] font-semibold", card.priority === "Critical" ? "text-red-500" : "text-orange-500")}>{card.priority}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Downtime</p>
                  <p className="numeric mt-0.5 text-[13px] font-semibold text-foreground">{card.estimatedDowntime}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cost</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-foreground">{card.estimatedCost}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                {card.sections.map((sec) => (
                  <div key={sec.heading}>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{sec.heading}</p>
                    <ul className="flex flex-col gap-1.5">
                      {sec.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
