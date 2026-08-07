import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/PageHeader";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { C, GRID, AXIS } from "@/lib/colors";
import { dateStr, dateTimeStr, timeStr } from "@/lib/format";
import { downloadCsv, buildPdf, downloadPdf } from "@/lib/pdf";
import {
  getSeedHistory,
  useAlerts,
  type HistoryRange,
} from "@/lib/simulation";

function TrendChart({
  data,
  color,
  unit,
  range,
  height = 190,
}: {
  data: Array<{ t: number; value: number }>;
  color: string;
  unit: string;
  range: HistoryRange;
  height?: number;
}) {
  const gid = color.replace(/[^a-zA-Z0-9]/g, "");
  const series = data.map((d) => ({
    label: range === "24h" ? timeStr(d.t) : dateStr(d.t),
    v: +d.value.toFixed(2),
  }));
  const tick = (label: string, i: number) => (i % (range === "24h" ? 3 : 4) === 0 ? label : "");
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={series} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`hgrad-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: AXIS, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
          tickFormatter={tick}
        />
        <YAxis tick={{ fill: AXIS, fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          contentStyle={{
            background: "#17213a",
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 10,
            fontSize: 12,
            color: "#e2e8f0",
          }}
          labelStyle={{ color: "#94a3b8", fontSize: 11 }}
          formatter={(val) => [`${Number(val).toFixed(2)} ${unit}`, ""]}
        />
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} fill={`url(#hgrad-${gid})`} dot={false} activeDot={{ r: 3 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function History() {
  const [range, setRange] = useState<HistoryRange>("24h");
  const liveAlerts = useAlerts();
  const seed = getSeedHistory(range);
  const rangeLabel = { "24h": "24 Hours", "7d": "7 Days", "30d": "30 Days" }[range];

  const alertHistory = useMemo(
    () => [...seed.alerts, ...liveAlerts.slice(0, 20)].slice(0, 30),
    [seed, liveAlerts],
  );

  const exportReport = () => {
    const pdf = buildPdf(
      "CentriGuard — Historical Report",
      `Asset CHW-02 · ${rangeLabel} window · Generated ${dateTimeStr(Date.now())}`,
      [
        {
          heading: "TREND SUMMARY",
          lines: [
            { text: `Bearing temperature: ${seed.temp[0]?.value.toFixed(1)} → ${seed.temp[seed.temp.length - 1]?.value.toFixed(1)} °C` },
            { text: `Bearing health: ${seed.health[0]?.value.toFixed(1)} → ${seed.health[seed.health.length - 1]?.value.toFixed(1)} %` },
            { text: `Vibration: ${seed.vibration[0]?.value.toFixed(2)} → ${seed.vibration[seed.vibration.length - 1]?.value.toFixed(2)} g` },
          ],
        },
        {
          heading: "ALERT HISTORY",
          lines: alertHistory.map((a) => ({
            text: `${dateTimeStr(a.ts)} · ${a.severity.toUpperCase()} · ${a.title}`,
          })),
        },
        {
          heading: "MAINTENANCE HISTORY",
          lines: seed.maintenance.map((m) => ({
            text: `${dateTimeStr(m.ts)} · ${m.action} · ${m.cost} · ${m.downtime}`,
          })),
        },
      ],
    );
    downloadPdf(`centriguard-history-${range}-${Date.now()}.pdf`, pdf);
  };

  const exportCsv = () => {
    downloadCsv(`centriguard-history-${range}-${Date.now()}.csv`, [
      ["time", "bearing_temp_c", "bearing_health_pct", "vibration_g"],
      ...seed.temp.map((p, i) => [
        new Date(p.t).toISOString(),
        p.value.toFixed(1),
        seed.health[i]?.value.toFixed(1) ?? "",
        seed.vibration[i]?.value.toFixed(2) ?? "",
      ]),
    ]);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="History"
        description="Archived trends, alert log and maintenance records for the selected window."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="size-3.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="size-3.5" /> PDF
            </Button>
          </>
        }
      />

      <Tabs value={range} onValueChange={(v) => setRange(v as HistoryRange)} className="gap-4">
        <TabsList>
          <TabsTrigger value="24h">24 Hours</TabsTrigger>
          <TabsTrigger value="7d">7 Days</TabsTrigger>
          <TabsTrigger value="30d">30 Days</TabsTrigger>
        </TabsList>

        {(["24h", "7d", "30d"] as HistoryRange[]).map((r) => (
          <TabsContent key={r} value={r}>
            <motion.div
              key={r}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="glass rounded-xl p-5">
                  <p className="mb-3 text-[13px] font-medium text-foreground">Temperature trend</p>
                  <TrendChart data={getSeedHistory(r).temp} color={C.orange} unit="°C" range={r} />
                </div>
                <div className="glass rounded-xl p-5">
                  <p className="mb-3 text-[13px] font-medium text-foreground">Bearing health trend</p>
                  <TrendChart data={getSeedHistory(r).health} color={C.green} unit="%" range={r} height={190} />
                </div>
                <div className="glass rounded-xl p-5">
                  <p className="mb-3 text-[13px] font-medium text-foreground">Vibration trend</p>
                  <TrendChart data={getSeedHistory(r).vibration} color={C.blue} unit="g" range={r} height={190} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="glass rounded-xl p-5">
                  <p className="mb-3 text-[13px] font-medium text-foreground">Alert history</p>
                  <div className="flex flex-col divide-y divide-border/40">
                    {alertHistory.slice(0, 12).map((a) => (
                      <div key={`${a.id}-${a.ts}`} className="flex items-center gap-3 py-2.5">
                        <SeverityBadge severity={a.severity} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12.5px] text-foreground">{a.title}</p>
                          <p className="text-[11px] text-muted-foreground">{dateTimeStr(a.ts)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-xl p-5">
                  <p className="mb-3 text-[13px] font-medium text-foreground">Maintenance history</p>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[11px] uppercase tracking-wider">Date</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider">Action</TableHead>
                        <TableHead className="text-right text-[11px] uppercase tracking-wider">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSeedHistory(r).maintenance.map((m) => (
                        <TableRow key={m.ts}>
                          <TableCell className="numeric text-[12px] text-muted-foreground">{dateStr(m.ts)}</TableCell>
                          <TableCell>
                            <p className="text-[12.5px] font-medium text-foreground">{m.action}</p>
                            <p className="text-[11px] text-muted-foreground">{m.detail}</p>
                          </TableCell>
                          <TableCell className="numeric text-right text-[12px]">{m.cost}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
