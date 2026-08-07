export function PumpIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 460 330" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="pi-casing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="pi-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="pi-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* floor */}
      <rect x="20" y="290" width="420" height="4" rx="2" fill="rgba(148,163,184,0.15)" />
      <rect x="60" y="294" width="8" height="26" fill="rgba(148,163,184,0.25)" />
      <rect x="120" y="294" width="8" height="26" fill="rgba(148,163,184,0.25)" />
      <rect x="320" y="294" width="8" height="26" fill="rgba(148,163,184,0.25)" />
      <rect x="380" y="294" width="8" height="26" fill="rgba(148,163,184,0.25)" />

      {/* suction pipe (left) */}
      <rect x="66" y="110" width="30" height="140" fill="url(#pi-metal)" rx="6" />
      <rect x="62" y="98" width="38" height="18" fill="url(#pi-metal)" rx="5" />
      {/* animated inflow */}
      <g className="flow-line-slow" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round">
        <line x1="81" y1="250" x2="81" y2="220" />
        <line x1="81" y1="200" x2="81" y2="170" />
        <line x1="81" y1="150" x2="81" y2="120" />
      </g>

      {/* discharge pipe (up-right) */}
      <rect x="300" y="70" width="30" height="120" fill="url(#pi-metal)" rx="6" />
      <rect x="300" y="58" width="120" height="18" fill="url(#pi-metal)" rx="5" />
      {/* animated outflow */}
      <g className="flow-line" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round">
        <line x1="315" y1="120" x2="315" y2="150" />
        <line x1="315" y1="170" x2="315" y2="200" />
        <line x1="340" y1="67" x2="370" y2="67" />
        <line x1="390" y1="67" x2="410" y2="67" />
      </g>

      {/* pump base */}
      <rect x="120" y="272" width="210" height="16" rx="6" fill="#1e293b" stroke="rgba(148,163,184,0.2)" />

      {/* motor */}
      <rect x="120" y="120" width="150" height="150" rx="14" fill="url(#pi-metal)" stroke="rgba(148,163,184,0.25)" />
      {/* cooling fins */}
      {[130, 150, 170, 190, 210, 230].map((x) => (
        <rect key={x} x={x} y="132" width="4" height="126" fill="rgba(148,163,184,0.12)" rx="2" />
      ))}
      {/* motor end cap */}
      <rect x="120" y="112" width="150" height="16" rx="8" fill="#0f172a" stroke="rgba(148,163,184,0.2)" />
      {/* motor fan guard */}
      <circle cx="195" cy="195" r="34" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="3" />
      <circle cx="195" cy="195" r="10" fill="rgba(148,163,184,0.25)" />
      {/* motor label */}
      <text x="195" y="238" textAnchor="middle" fill="#94a3b8" fontSize="9" letterSpacing="2" style={{ fontFamily: "JetBrains Mono, monospace" }}>
        30 HP · 2950 RPM
      </text>

      {/* shaft + coupling */}
      <rect x="270" y="188" width="30" height="14" fill="#64748b" />
      <rect x="292" y="182" width="14" height="26" rx="3" fill="#94a3b8" />
      <circle cx="299" cy="195" r="4" fill="#0f172a" />

      {/* pump casing / volute */}
      <path
        d="M306 150 C 380 130, 420 190, 380 240 C 350 278, 306 258, 306 240 Z"
        fill="url(#pi-casing)"
        stroke="#3b82f6"
        strokeOpacity="0.55"
        strokeWidth="2"
      />
      <circle cx="330" cy="196" r="52" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="2" />

      {/* impeller (rotating) */}
      <g style={{ transformOrigin: "330px 196px", animation: "pg-spin 4.5s linear infinite" }}>
        <circle cx="330" cy="196" r="30" fill="rgba(6,182,212,0.12)" stroke="#06b6d4" strokeOpacity="0.6" strokeWidth="2" />
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={deg}
            d="M330 196 C 348 196, 356 212, 348 222 C 340 230, 330 210, 330 196 Z"
            fill="#06b6d4"
            fillOpacity="0.55"
            transform={`rotate(${deg} 330 196)`}
          />
        ))}
        <circle cx="330" cy="196" r="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
      </g>

      {/* casing highlight */}
      <path d="M340 160 C 368 172, 380 200, 366 232" stroke="url(#pi-shine)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* DE bearing indicator on pump side */}
      <circle cx="306" cy="196" r="6" fill="#22c55e" opacity="0.9" />
      <circle cx="306" cy="196" r="11" fill="none" stroke="#22c55e" strokeOpacity="0.35" strokeWidth="2" className="pulse-soft" />
    </svg>
  );
}
