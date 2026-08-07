import { motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  Cog,
  FlaskConical,
  Gauge,
  Info,
  Network,
  Rocket,
  Search,
  ShieldAlert,
  Waves,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { DOC_SECTIONS } from "@/lib/data";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Info,
  AlertTriangle,
  Cog,
  Waves,
  Gauge,
  Network,
  ShieldAlert,
  FlaskConical,
  Rocket,
};

export default function Docs() {
  const [q, setQ] = useState("");
  const sections = useMemo(() => {
    if (!q.trim()) return DOC_SECTIONS;
    const s = q.toLowerCase();
    return DOC_SECTIONS.filter((d) =>
      (d.title + d.body.join(" ")).toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Documentation"
        description="Engineering documentation for the CentriGuard platform — design, thresholds, pilot plan, and known limitations."
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search documentation…"
              className="pl-9"
            />
          </div>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto w-full max-w-3xl"
      >
        {sections.length === 0 && (
          <div className="glass flex flex-col items-center gap-3 rounded-xl p-12 text-center">
            <BookOpen className="size-8 text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">No sections match “{q}”</p>
          </div>
        )}
        <Accordion type="single" collapsible className="glass rounded-xl px-5">
          {sections.map((sec, i) => {
            const Icon = ICONS[sec.icon] ?? Info;
            return (
              <AccordionItem key={sec.id} value={sec.id} className="border-border/50">
                <AccordionTrigger className="gap-3 py-4 hover:no-underline">
                  <span className="flex items-center gap-3 text-left">
                    <span className="flex size-8 items-center justify-center rounded-md border border-primary/20 bg-primary/8 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-[13.5px] font-medium text-foreground">{sec.title}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2.5 pl-11 pr-2">
                    {sec.body.map((p, j) => (
                      <p key={j} className="text-[12.5px] leading-relaxed text-muted-foreground">
                        {p}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          {sections.length} section{sections.length === 1 ? "" : "s"} · v1.0 · CHW-02 fleet documentation
        </p>
      </motion.div>
    </div>
  );
}
