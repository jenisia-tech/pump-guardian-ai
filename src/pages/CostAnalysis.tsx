import { motion } from "framer-motion";
import { IndianRupee, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/PageHeader";
import { COST_BARS, COST_KPIS, ROI_LINE } from "@/lib/data";
import { C, GRID, AXIS } from "@/lib/colors";

const tooltipStyle = {
  background: "#17213a",
  border: "1px solid rgba(148,163,184,0.2)",
  borderRadius: 10,
  fontSize: 12,
  color: "#e2e8f0",
};

export default function CostAnalysis() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cost Analysis"
        description="Financial case for predictive maintenance on CHW-02 — monitoring spend versus the cost of unexpected failure."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
        {COST_KPIS.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="glass rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
          >
            <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{k.label}</p>
            <p className="numeric mt-2 text-[17px] font-semibold tracking-tight" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="mt-1 text-[10.5px] leading-snug text-muted-foreground">{k.note}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="glass rounded-xl p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-medium text-foreground">Monthly cost — preventive vs unexpected failure</h3>
              <p className="text-[11.5px] text-muted-foreground">₹ Lakhs · simulated plant-wide exposure</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={COST_BARS} margin={{ top: 6, right: 6, left: 0, bottom: 0 }} barGap={3}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: AXIS, fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: AXIS, fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val, name) => [`₹${Number(val).toFixed(1)}L`, name === "preventive" ? "Preventive" : "Unexpected failure"]} />
              <Legend formatter={(v) => (v === "preventive" ? "Preventive (₹L)" : "Unexpected failure (₹L)")} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              <Bar dataKey="preventive" fill={C.blue} radius={[4, 4, 0, 0]} maxBarSize={14} />
              <Bar dataKey="failure" fill={C.red} radius={[4, 4, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="glass rounded-xl p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-medium text-foreground">Cumulative ROI — monitoring spend vs avoided cost</h3>
              <p className="text-[11.5px] text-muted-foreground">₹ Lakhs · crossover before month 12</p>
            </div>
            <span className="flex items-center gap-1 rounded-full border border-green-500/25 bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-500">
              <TrendingUp className="size-3.5" /> ROI &lt; 1 year
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ROI_LINE} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: AXIS, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(m) => `M${m}`} />
              <YAxis tick={{ fill: AXIS, fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val, name) => [`₹${Number(val).toFixed(1)}L`, name === "spend" ? "Cumulative spend" : "Avoided cost"]} />
              <Legend formatter={(v) => (v === "spend" ? "Cumulative spend" : "Avoided failure cost")} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              <Line type="monotone" dataKey="spend" stroke={C.blue} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="avoided" stroke={C.green} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="glass flex flex-col gap-4 rounded-xl p-6 sm:flex-row sm:items-center"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-green-500/25 bg-green-500/10 text-green-500">
          <IndianRupee className="size-5" />
        </div>
        <div>
          <p className="text-[13.5px] font-semibold text-foreground">Payback summary</p>
          <p className="mt-1 max-w-3xl text-[12.5px] leading-relaxed text-muted-foreground">
            A single avoided unexpected failure (₹4–8 L/hr during peak cooling season) covers the entire annual
            monitoring cost (₹1.3 L) within weeks. With three pump failures typically avoided per year, cumulative
            savings cross the spend line before month 9 — a return on investment of less than one year.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
