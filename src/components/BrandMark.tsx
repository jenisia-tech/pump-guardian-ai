import { cn } from "@/lib/utils";

export function BrandMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      {/* shield outline */}
      <path
        d="M24 3 L41 9.5 V22 C41 32.5 34 40.5 24 45 C14 40.5 7 32.5 7 22 V9.5 Z"
        stroke="url(#pg-brand-grad)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="rgb(37 99 235 / 0.08)"
      />
      <defs>
        <linearGradient id="pg-brand-grad" x1="7" y1="3" x2="41" y2="45">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* rotating impeller */}
      <g style={{ transformOrigin: "24px 26px", animation: "pg-spin 7s linear infinite" }}>
        <circle cx="24" cy="26" r="3.2" fill="#06b6d4" />
        {[0, 120, 240].map((deg) => (
          <path
            key={deg}
            d="M24 26 L24 12.5"
            stroke="#3b82f6"
            strokeWidth="2.6"
            strokeLinecap="round"
            transform={`rotate(${deg} 24 26)`}
          />
        ))}
      </g>
      {/* water drop */}
      <path
        d="M24 30.5 C27.4 33.4 29 35.4 29 37.2 C29 40 26.8 41.5 24 41.5 C21.2 41.5 19 40 19 37.2 C19 35.4 20.6 33.4 24 30.5 Z"
        fill="url(#pg-brand-grad)"
        opacity="0.9"
      />
      <style>{`@keyframes pg-spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

export function Wordmark({
  className,
  size = 36,
  sub = "Centrifugal Pump Analytics",
}: {
  className?: string;
  size?: number;
  sub?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark size={size} />
      <div className="leading-none">
        <p className="text-[15px] font-semibold tracking-tight text-foreground">
          Centri<span className="text-primary">Guard</span>
        </p>
        {sub && (
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
