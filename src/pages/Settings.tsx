import { motion } from "framer-motion";
import {
  Bell,
  Download,
  FileText,
  Languages,
  Moon,
  RefreshCw,
  Sun,
  Timer,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { buildPdf, downloadPdf } from "@/lib/pdf";
import { simulation, useAlerts, useSimMode } from "@/lib/simulation";
import { useSimulation } from "@/lib/simulation";
import { cn } from "@/lib/utils";
import { dateTimeStr } from "@/lib/format";
import { MAINTENANCE_CARDS } from "@/lib/data";

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 py-4 last:border-0">
      {children}
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const s = useSimulation();
  const mode = useSimMode();
  const alerts = useAlerts();
  const isDark = theme === "dark";

  const exportMaintenance = () => {
    const cards = MAINTENANCE_CARDS.filter(
      (c) => (mode === "bearing" || mode === "healthy" ? c.id === "bearing" : mode === "cavitation" ? c.id === "cavitation" : true),
    );
    const pdf = buildPdf(
      "PumpGuardian AI — Maintenance Report",
      `Generated ${dateTimeStr(Date.now())} · Mode: ${mode}`,
      cards.map((c) => ({
        heading: c.title.toUpperCase(),
        lines: [
          { text: `Priority: ${c.priority} · Downtime: ${c.estimatedDowntime} · Cost: ${c.estimatedCost}` },
          ...c.sections.flatMap((sec) => [{ text: sec.heading, bold: true }, ...sec.items.map((it) => ({ text: `• ${it}` }))]),
        ],
      })),
    );
    downloadPdf(`pumpguardian-maintenance-${Date.now()}.pdf`, pdf);
    toast.success("Maintenance report exported");
  };

  const exportHistory = () => {
    const pdf = buildPdf(
      "PumpGuardian AI — Historical Report",
      `Generated ${dateTimeStr(Date.now())}`,
      [
        {
          heading: "LIVE WINDOW SUMMARY",
          lines: [
            { text: `Bearing temperature: ${s.bearingTemp.toFixed(1)} °C` },
            { text: `Bearing health: ${s.bearingHealth.toFixed(1)} % · RUL ${s.rul.toFixed(1)} days` },
            { text: `Efficiency: ${s.efficiency.toFixed(1)} % · Cavitation risk: ${s.cavitationRisk.toFixed(0)} %` },
          ],
        },
        {
          heading: "RECENT ALERTS",
          lines: alerts.slice(0, 25).map((a) => ({ text: `${dateTimeStr(a.ts)} · ${a.severity.toUpperCase()} · ${a.title}` })),
        },
      ],
    );
    downloadPdf(`pumpguardian-history-${Date.now()}.pdf`, pdf);
    toast.success("Historical report exported");
  };

  const exportAlerts = () => {
    const pdf = buildPdf(
      "PumpGuardian AI — Alert Report",
      `Generated ${dateTimeStr(Date.now())} · ${alerts.length} alerts`,
      alerts.slice(0, 60).map((a) => ({
        heading: a.title.toUpperCase(),
        lines: [
          { text: `${dateTimeStr(a.ts)} · Severity: ${a.severity.toUpperCase()} · ${a.source}` },
          { text: a.detail },
          ...(a.recommendation ? [{ text: `Action: ${a.recommendation}` }] : []),
        ],
      })),
    );
    downloadPdf(`pumpguardian-alerts-${Date.now()}.pdf`, pdf);
    toast.success("Alert report exported");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Platform preferences, simulation controls, and report exports." />

      <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 lg:grid-cols-2">
        {/* appearance */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="glass rounded-xl p-5">
          <h3 className="mb-1 flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
            {isDark ? <Moon className="size-4 text-primary" /> : <Sun className="size-4 text-amber-500" />}
            Appearance
          </h3>
          <p className="mb-3 text-[11.5px] text-muted-foreground">Industrial dark mode is the control-room default.</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "dark", label: "Dark Mode", icon: Moon },
              { id: "light", label: "Light Mode", icon: Sun },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setTheme(m.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-[12.5px] font-medium transition-all",
                  isDark === (m.id === "dark")
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:border-white/25 hover:text-foreground",
                )}
              >
                <m.icon className="size-4" /> {m.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* notifications */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.35 }} className="glass rounded-xl p-5">
          <h3 className="mb-1 flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
            <Bell className="size-4 text-primary" /> Notifications
          </h3>
          <p className="mb-2 text-[11.5px] text-muted-foreground">Floating alerts for threshold crossings and mode changes.</p>
          <Row>
            <div>
              <p className="text-[13px] font-medium text-foreground">Fault notifications</p>
              <p className="text-[11px] text-muted-foreground">Toast alerts when thresholds are crossed</p>
            </div>
            <Switch
              checked={simulation.notificationsEnabled}
              onCheckedChange={(v) => {
                simulation.setNotificationsEnabled(v);
                toast[v ? "success" : "info"](v ? "Notifications enabled" : "Notifications muted");
              }}
            />
          </Row>
        </motion.div>

        {/* simulation speed */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }} className="glass rounded-xl p-5">
          <h3 className="mb-1 flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
            <Timer className="size-4 text-primary" /> Simulation speed
          </h3>
          <p className="mb-4 text-[11.5px] text-muted-foreground">Scale how fast fault signatures develop (0.5× – 8×).</p>
          <div className="flex items-center gap-4">
            <Slider
              value={[simulation.speed]}
              min={0.5}
              max={8}
              step={0.5}
              onValueChange={(v) => simulation.setSpeed(v[0])}
              className="flex-1"
            />
            <span className="numeric w-12 text-right text-[14px] font-semibold text-primary">{simulation.speed}×</span>
          </div>
        </motion.div>

        {/* language */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.35 }} className="glass rounded-xl p-5">
          <h3 className="mb-1 flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
            <Languages className="size-4 text-primary" /> Language
          </h3>
          <p className="mb-4 text-[11.5px] text-muted-foreground">Interface and report language.</p>
          <Select value="en" onValueChange={(v) => toast.info(`Language set to ${v === "en" ? "English" : v}`)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="English" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English (US)</SelectItem>
              <SelectItem value="hi">हिन्दी (coming soon)</SelectItem>
              <SelectItem value="de">Deutsch (coming soon)</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* export reports */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }} className="glass rounded-xl p-5 lg:col-span-2">
          <h3 className="mb-1 flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
            <FileText className="size-4 text-primary" /> Export reports
          </h3>
          <p className="mb-4 text-[11.5px] text-muted-foreground">Download PDF snapshots for the maintenance file or shift handover.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button variant="outline" onClick={exportMaintenance} className="h-auto justify-start gap-2.5 py-3">
              <Download className="size-4 text-primary" />
              <span className="text-left">
                <span className="block text-[12.5px] font-medium">Maintenance report</span>
                <span className="block text-[10.5px] font-normal text-muted-foreground">Active procedure PDF</span>
              </span>
            </Button>
            <Button variant="outline" onClick={exportHistory} className="h-auto justify-start gap-2.5 py-3">
              <Download className="size-4 text-primary" />
              <span className="text-left">
                <span className="block text-[12.5px] font-medium">Historical report</span>
                <span className="block text-[10.5px] font-normal text-muted-foreground">Live window + alerts PDF</span>
              </span>
            </Button>
            <Button variant="outline" onClick={exportAlerts} className="h-auto justify-start gap-2.5 py-3">
              <Download className="size-4 text-primary" />
              <span className="text-left">
                <span className="block text-[12.5px] font-medium">Alert report</span>
                <span className="block text-[10.5px] font-normal text-muted-foreground">Full alert log PDF</span>
              </span>
            </Button>
          </div>
        </motion.div>

        {/* danger zone */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }} className="rounded-xl border border-red-500/25 bg-red-500/5 p-5 lg:col-span-2">
          <h3 className="mb-1 flex items-center gap-2 text-[13.5px] font-semibold text-red-500">
            <RefreshCw className="size-4" /> Reset simulation
          </h3>
          <p className="mb-4 text-[11.5px] text-muted-foreground">
            Return all sensor values to the healthy baseline and clear the alert log. Current mode: {mode}.
          </p>
          <Button
            variant="destructive"
            onClick={() => {
              simulation.reset();
              toast.success("Simulation reset to healthy baseline");
            }}
          >
            <RefreshCw className="size-4" /> Reset simulation
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
