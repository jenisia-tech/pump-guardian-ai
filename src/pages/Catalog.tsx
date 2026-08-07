import { motion } from "framer-motion";
import { Boxes, Check, Gauge as GaugeIcon, Plus, Search, Waves, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATALOG, CATALOG_CATEGORIES, type CatalogItem } from "@/lib/data";
import { isInFleet, toggleFleet, useFleet } from "@/lib/fleet";
import { cn } from "@/lib/utils";

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-1.5 last:border-0">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="numeric text-[12.5px] font-medium text-foreground">{v}</span>
    </div>
  );
}

function PumpCard({ item, index }: { item: CatalogItem; index: number }) {
  const inFleet = isInFleet(item.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.35 }}
      className={cn(
        "glass flex flex-col rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20",
        item.id === "cg-30chw" && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/8 text-primary">
          <Waves className="size-5" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="border-border/60 text-muted-foreground">
            {item.category}
          </Badge>
          {item.id === "cg-30chw" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-green-500">
              <span className="size-1.5 animate-pulse rounded-full bg-green-500" /> Live twin
            </span>
          )}
        </div>
      </div>

      <p className="numeric mt-3 text-[13px] font-semibold text-primary">{item.model}</p>
      <h3 className="text-[14px] font-semibold text-foreground">{item.name}</h3>
      <p className="mt-1.5 min-h-10 text-[12px] leading-relaxed text-muted-foreground">{item.blurb}</p>

      <div className="mt-3 flex-1">
        <Spec k="Motor" v={`${item.hp} HP · ${item.kw} kW`} />
        <Spec k="Speed" v={`${item.rpm} rpm`} />
        <Spec k="Flow / head" v={`${item.flow} m³/h · ${item.head} m`} />
        <Spec k="Bearings" v={item.bearings} />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Monitoring</p>
          <p className="text-[12px] font-semibold text-foreground">
            {item.monitoring} · {item.price}
          </p>
        </div>
        <Badge className={item.monitoring === "Pro" ? "border-primary/30 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"}>
          {item.monitoring}
        </Badge>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant={inFleet ? "secondary" : "default"}
          size="sm"
          className="flex-1"
          onClick={() => {
            toggleFleet(item.id);
            toast[inFleet ? "info" : "success"](
              inFleet ? `Removed ${item.model} from your fleet` : `Added ${item.model} to your fleet`,
            );
          }}
        >
          {inFleet ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
          {inFleet ? "In your fleet" : "Add to fleet"}
        </Button>
        {item.id === "cg-30chw" && (
          <Link to="/digital-twin">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Boxes className="size-3.5" /> Twin
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default function Catalog() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const fleet = useFleet();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return CATALOG.filter((c) => {
      if (category !== "All" && c.category !== category) return false;
      if (s && !(c.model + c.name + c.category + c.blurb).toLowerCase().includes(s)) return false;
      return true;
    });
  }, [q, category]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pump Catalog"
        description="Browse CentriGuard-ready centrifugal pump models, compare specifications, and add units to your fleet. The CG-30 CHW reference unit powers the live digital twin."
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search model, duty, spec…"
              className="pl-9"
            />
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {CATALOG_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all duration-200",
                category === c
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:border-white/25 hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-2 text-[12px] text-muted-foreground">
            <Zap className="size-3.5 text-primary" />
            {fleet.length} unit{fleet.length === 1 ? "" : "s"} in your fleet
          </span>
        </div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass flex flex-col items-center gap-3 rounded-xl p-12 text-center"
          >
            <GaugeIcon className="size-8 text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">No pumps match your search</p>
            <p className="max-w-sm text-[12.5px] text-muted-foreground">
              Try a different model name, duty category, or clear the filters.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filtered.map((item, i) => (
              <PumpCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
