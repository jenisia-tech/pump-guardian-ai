import { Download, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { C } from "@/lib/colors";
import { timeStr } from "@/lib/format";
import { downloadCsv } from "@/lib/pdf";
import { useHistory, useSimulation } from "@/lib/simulation";

export default function LiveMonitoring() {
  const s = useSimulation();
  const history = useHistory(120);
  const [paused, setPaused] = useState(false);
  const [frozen, setFrozen] = useState(history);

  useEffect(() => {
    if (!paused) setFrozen(history);
  }, [paused, history]);

  const data = paused ? frozen : history;
  const series = {
    bvib: data.map((h) => ({ t: h.t, v: h.bvib })),
    hvib: data.map((h) => ({ t: h.t, v: h.hvib })),
    temp: data.map((h) => ({ t: h.t, v: h.temp })),
    speed: data.map((h) => ({ t: h.t, v: h.speed })),
    eff: data.map((h) => ({ t: h.t, v: h.eff })),
    bpfo: data.map((h) => ({ t: h.t, v: h.bpfo })),
    rms: data.map((h) => ({ t: h.t, v: h.rms })),
  };

  const exportCsv = () => {
    downloadCsv(`centriguard-live-${Date.now()}.csv`, [
      ["time", "bearing_vib_g", "hf_vib_g", "bearing_temp_c", "speed_rpm", "efficiency_pct", "bpfo_g", "overall_rms_g"],
      ...data.map((h) => [
        timeStr(h.t),
        h.bvib.toFixed(3),
        h.hvib.toFixed(3),
        h.temp.toFixed(1),
        h.speed.toFixed(0),
        h.eff.toFixed(1),
        h.bpfo.toFixed(3),
        h.rms.toFixed(3),
      ]),
    ]);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Live Monitoring"
        description="Continuous vibration, temperature and performance telemetry — refreshed every second from the simulated acquisition chain."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaused((p) => !p)}
              className={paused ? "border-amber-500/40 text-amber-500" : ""}
            >
              {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
              {paused ? "Resume" : "Pause"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="size-3.5" /> Export CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ChartCard
          title="Motor Bearing Vibration"
          subtitle="Accelerometer 1 · healthy 0.5–1.0 g"
          data={series.bvib}
          color={C.blue}
          unit="g"
          decimals={2}
          domain={[0, "auto"]}
        />
        <ChartCard
          title="Pump High-Frequency Vibration"
          subtitle="Accelerometer 2 · cavitation band"
          data={series.hvib}
          color={C.cyan}
          unit="g"
          decimals={2}
          domain={[0, "auto"]}
        />
        <ChartCard
          title="Bearing Temperature"
          subtitle="RTD · healthy 50–55 °C"
          data={series.temp}
          color={C.orange}
          unit="°C"
          decimals={1}
          domain={[35, 85]}
        />
        <ChartCard
          title="Motor Speed"
          subtitle="Rated 2950 RPM"
          data={series.speed}
          color={C.slate}
          unit="rpm"
          decimals={0}
          domain={[2850, 3000]}
        />
        <ChartCard
          title="Pump Efficiency"
          subtitle="Best efficiency point 96%"
          data={series.eff}
          color={C.green}
          unit="%"
          decimals={1}
          domain={[40, 100]}
        />
        <ChartCard
          title="BPFO Peak"
          subtitle="Outer-race defect frequency"
          data={series.bpfo}
          color={C.blue}
          unit="g"
          decimals={3}
          domain={[0, "auto"]}
        />
        <ChartCard
          title="Overall RMS"
          subtitle="Broadband vibration · ISO 10816"
          data={series.rms}
          color={C.violet}
          unit="g"
          decimals={2}
          domain={[0, "auto"]}
        />
        <div className="glass flex flex-col justify-center rounded-xl p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Acquisition chain</p>
          <div className="mt-3 flex flex-col gap-2 text-[12.5px]">
            {[
              ["Sample rate", "25.6 kS/s"],
              ["Window", "4096 pt · Hanning"],
              ["Resolution", "6.25 Hz"],
              ["Buffer", `${data.length} samples`],
              ["Status", s.status],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-border/40 pb-1.5 last:border-0">
                <span className="text-muted-foreground">{k}</span>
                <span className="numeric font-medium text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
