import { cn } from "@/lib/utils";

export type TwinPartId =
  | "motor"
  | "bearing"
  | "shaft"
  | "casing"
  | "impeller"
  | "suction"
  | "discharge";

interface DigitalTwinSVGProps {
  selected: TwinPartId | null;
  onSelect: (id: TwinPartId) => void;
  flowRate: number;
  running: boolean;
  cavitationRisk: number;
}

const PART_LABEL: Record<TwinPartId, string> = {
  motor: "Motor",
  bearing: "Drive-End Bearing",
  shaft: "Shaft & Coupling",
  casing: "Pump Casing",
  impeller: "Impeller",
  suction: "Suction Pipe",
  discharge: "Discharge Pipe",
};

export function DigitalTwinSVG({
  selected,
  onSelect,
  flowRate,
  running,
  cavitationRisk,
}: DigitalTwinSVGProps) {
  const active = (id: TwinPartId) => selected === id;
  const partClass = (id: TwinPartId) =>
    cn(
      "cursor-pointer transition-all duration-300",
      active(id)
        ? "opacity-100"
        : selected
          ? "opacity-50 hover:opacity-80"
          : "opacity-90 hover:opacity-100",
    );
  const flowDur = running && flowRate > 0.5 ? `${Math.max(0.5, (1.2 * 62) / flowRate).toFixed(2)}s` : "0s";

  return (
    <svg viewBox="0 0 820 520" fill="none" className="w-full">
      <defs>
        <linearGradient id="dt-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="dt-casing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.10" />
        </linearGradient>
        <radialGradient id="dt-bearing" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      {/* base plate */}
      <rect x="80" y="470" width="660" height="18" rx="7" fill="#1e293b" stroke="rgba(148,163,184,0.18)" />
      <rect x="120" y="488" width="10" height="22" fill="rgba(148,163,184,0.2)" />
      <rect x="240" y="488" width="10" height="22" fill="rgba(148,163,184,0.2)" />
      <rect x="560" y="488" width="10" height="22" fill="rgba(148,163,184,0.2)" />
      <rect x="680" y="488" width="10" height="22" fill="rgba(148,163,184,0.2)" />

      {/* ---------------- suction pipe ---------------- */}
      <g
        className={partClass("suction")}
        onClick={() => onSelect("suction")}
        role="button"
        aria-label="Suction pipe"
      >
        <rect x="414" y="330" width="56" height="146" rx="10" fill="url(#dt-metal)" stroke={active("suction") ? "#06b6d4" : "rgba(148,163,184,0.3)"} strokeWidth={active("suction") ? 2.5 : 1.5} />
        <rect x="404" y="312" width="76" height="26" rx="8" fill="url(#dt-metal)" stroke={active("suction") ? "#06b6d4" : "rgba(148,163,184,0.3)"} strokeWidth={active("suction") ? 2.5 : 1.5} />
        <rect x="428" y="466" width="28" height="8" rx="3" fill="rgba(148,163,184,0.35)" />
        {running && flowRate > 0.5 && (
          <g stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" className="flow-line-slow" style={{ animationDuration: flowDur }}>
            <line x1="442" y1="452" x2="442" y2="416" />
            <line x1="442" y1="400" x2="442" y2="364" />
            <line x1="442" y1="348" x2="442" y2="330" />
          </g>
        )}
        <text x="442" y="506" textAnchor="middle" fill="#94a3b8" fontSize="10" letterSpacing="1.5">SUCTION</text>
      </g>

      {/* ---------------- discharge pipe ---------------- */}
      <g
        className={partClass("discharge")}
        onClick={() => onSelect("discharge")}
        role="button"
        aria-label="Discharge pipe"
      >
        <rect x="600" y="140" width="56" height="170" rx="10" fill="url(#dt-metal)" stroke={active("discharge") ? "#06b6d4" : "rgba(148,163,184,0.3)"} strokeWidth={active("discharge") ? 2.5 : 1.5} />
        <rect x="592" y="108" width="190" height="26" rx="8" fill="url(#dt-metal)" stroke={active("discharge") ? "#06b6d4" : "rgba(148,163,184,0.3)"} strokeWidth={active("discharge") ? 2.5 : 1.5} />
        {running && flowRate > 0.5 && (
          <g stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" className="flow-line" style={{ animationDuration: flowDur }}>
            <line x1="628" y1="292" x2="628" y2="256" />
            <line x1="628" y1="240" x2="628" y2="204" />
            <line x1="628" y1="188" x2="628" y2="160" />
            <line x1="650" y1="121" x2="690" y2="121" />
            <line x1="710" y1="121" x2="750" y2="121" />
          </g>
        )}
        <text x="628" y="330" textAnchor="middle" fill="#94a3b8" fontSize="10" letterSpacing="1.5">DISCHARGE</text>
      </g>

      {/* ---------------- motor ---------------- */}
      <g
        className={partClass("motor")}
        onClick={() => onSelect("motor")}
        role="button"
        aria-label="Motor"
      >
        <rect x="120" y="240" width="240" height="228" rx="16" fill="url(#dt-metal)" stroke={active("motor") ? "#3b82f6" : "rgba(148,163,184,0.25)"} strokeWidth={active("motor") ? 2.5 : 1.5} />
        {[138, 160, 182, 204, 226, 248, 270, 292].map((x) => (
          <rect key={x} x={x} y="256" width="5" height="196" rx="2.5" fill="rgba(148,163,184,0.10)" />
        ))}
        {/* terminal box */}
        <rect x="200" y="196" width="80" height="52" rx="8" fill="#0f172a" stroke="rgba(148,163,184,0.25)" />
        <rect x="214" y="210" width="52" height="10" rx="3" fill="rgba(148,163,184,0.15)" />
        {/* fan guard */}
        <circle cx="150" cy="354" r="52" fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth="3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="150"
            y1="354"
            x2={150 + 48 * Math.cos((deg * Math.PI) / 180)}
            y2={354 + 48 * Math.sin((deg * Math.PI) / 180)}
            stroke="rgba(148,163,184,0.15)"
            strokeWidth="2.5"
          />
        ))}
        <circle cx="150" cy="354" r="10" fill="rgba(148,163,184,0.3)" />
        {/* motor label */}
        <text x="240" y="436" textAnchor="middle" fill="#94a3b8" fontSize="11" letterSpacing="2" style={{ fontFamily: "JetBrains Mono, monospace" }}>
          30 HP · 22 kW
        </text>
        <text x="240" y="452" textAnchor="middle" fill="#64748b" fontSize="9" letterSpacing="1.5">3-PHASE INDUCTION</text>
      </g>

      {/* ---------------- shaft & coupling ---------------- */}
      <g
        className={partClass("shaft")}
        onClick={() => onSelect("shaft")}
        role="button"
        aria-label="Shaft and coupling"
      >
        <rect x="358" y="340" width="180" height="26" rx="13" fill="#64748b" stroke={active("shaft") ? "#3b82f6" : "rgba(148,163,184,0.3)"} strokeWidth={active("shaft") ? 2.5 : 1} />
        <rect x="410" y="330" width="30" height="46" rx="6" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
        <circle cx="425" cy="353" r="7" fill="#0f172a" />
        {/* coupling bolts */}
        <circle cx="418" cy="338" r="3" fill="#0f172a" />
        <circle cx="432" cy="338" r="3" fill="#0f172a" />
        <circle cx="418" cy="368" r="3" fill="#0f172a" />
        <circle cx="432" cy="368" r="3" fill="#0f172a" />
      </g>

      {/* ---------------- DE bearing ---------------- */}
      <g
        className={partClass("bearing")}
        onClick={() => onSelect("bearing")}
        role="button"
        aria-label="Drive-end bearing"
      >
        <rect x="472" y="318" width="52" height="70" rx="12" fill="#0f172a" stroke={active("bearing") ? "#22c55e" : "rgba(148,163,184,0.35)"} strokeWidth={active("bearing") ? 2.5 : 1.5} />
        <circle cx="498" cy="353" r="20" fill="url(#dt-bearing)" />
        <circle cx="498" cy="353" r="20" fill="none" stroke={active("bearing") ? "#22c55e" : "rgba(34,197,94,0.4)"} strokeWidth="2" />
        <circle cx="498" cy="353" r="9" fill="#0f172a" stroke="#22c55e" strokeOpacity="0.6" />
        {active("bearing") && (
          <circle cx="498" cy="353" r="26" fill="none" stroke="#22c55e" strokeOpacity="0.4" strokeWidth="1.5" className="pulse-soft" />
        )}
        <text x="498" y="404" textAnchor="middle" fill="#94a3b8" fontSize="8.5" letterSpacing="1">DE 6311</text>
      </g>

      {/* ---------------- pump casing ---------------- */}
      <g
        className={partClass("casing")}
        onClick={() => onSelect("casing")}
        role="button"
        aria-label="Pump casing"
      >
        <path
          d="M528 300 C 640 262, 712 330, 656 400 C 610 462, 528 428, 528 392 C 528 350, 528 330, 528 300 Z"
          fill="url(#dt-casing)"
          stroke={active("casing") ? "#3b82f6" : "#3b82f6"}
          strokeOpacity={active("casing") ? 0.9 : 0.45}
          strokeWidth={active("casing") ? 2.5 : 1.8}
        />
        <path d="M556 320 C 600 322, 634 350, 634 380" stroke="rgba(226,232,240,0.35)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M560 415 C 592 428, 618 416, 630 396" stroke="rgba(148,163,184,0.25)" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* casing studs */}
        {[545, 580, 615, 650].map((x) => (
          <circle key={x} cx={x} cy="346" r="3.5" fill="#1e293b" stroke="rgba(148,163,184,0.4)" />
        ))}
      </g>

      {/* ---------------- impeller ---------------- */}
      <g
        className={partClass("impeller")}
        onClick={() => onSelect("impeller")}
        role="button"
        aria-label="Impeller"
      >
        <g style={{ transformOrigin: "592px 362px", animation: running ? "pg-spin 3.2s linear infinite" : "none" }}>
          <circle cx="592" cy="362" r="46" fill="rgba(6,182,212,0.10)" stroke={active("impeller") ? "#06b6d4" : "rgba(6,182,212,0.55)"} strokeWidth={active("impeller") ? 2.5 : 1.8} />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <path
              key={deg}
              d="M592 362 C 620 362, 632 388, 622 404 C 610 418, 592 386, 592 362 Z"
              fill="#06b6d4"
              fillOpacity={active("impeller") ? 0.75 : 0.45}
              transform={`rotate(${deg} 592 362)`}
            />
          ))}
          <circle cx="592" cy="362" r="12" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />
        </g>
        {/* cavitation indicator */}
        {cavitationRisk > 45 && (
          <g>
            <circle cx="646" cy="404" r="7" fill="#f97316" className="pulse-soft" />
            <text x="660" y="408" fill="#f97316" fontSize="9" fontWeight="600">CAV</text>
          </g>
        )}
      </g>

      {/* selection legend */}
      <g>
        {Object.entries(PART_LABEL).map(([id, label], i) => (
          <g
            key={id}
            onClick={() => onSelect(id as TwinPartId)}
            className="cursor-pointer"
            opacity={active(id as TwinPartId) ? 1 : 0.65}
          >
            <rect x={120 + i * 100} y="26" width="92" height="26" rx="6" fill={active(id as TwinPartId) ? "rgba(59,130,246,0.15)" : "rgba(15,23,42,0.6)"} stroke={active(id as TwinPartId) ? "#3b82f6" : "rgba(148,163,184,0.2)"} strokeWidth="1" />
            <circle cx={134 + i * 100} cy="39" r="3" fill={active(id as TwinPartId) ? "#3b82f6" : "#64748b"} />
            <text x={144 + i * 100} y="43" fill={active(id as TwinPartId) ? "#e2e8f0" : "#94a3b8"} fontSize="8.5" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              {label.toUpperCase().slice(0, 13)}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export const TWIN_PART_LABEL = PART_LABEL;
