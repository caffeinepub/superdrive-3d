import { CAR_DATA, useGameStore } from "../store/gameStore";

export function Speedometer() {
  const { speed, nitro, isNitroActive, distance, selectedCar } = useGameStore();
  const car = CAR_DATA[selectedCar];
  const maxSpeed = car.topSpeed;

  // Needle angle: -135deg (0) to +135deg (max)
  const speedPercent = Math.min(speed / maxSpeed, 1);
  const needleAngle = -135 + speedPercent * 270;

  return (
    <div className="speedometer flex flex-col items-center gap-1">
      {/* Circular speedometer */}
      <div className="relative" style={{ width: 120, height: 120 }}>
        {/* SVG dial */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{ position: "absolute", inset: 0 }}
          aria-hidden="true"
        >
          <title>Speedometer</title>
          {/* Outer ring */}
          <circle
            cx="60"
            cy="60"
            r="56"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
          />

          {/* Speed arc background */}
          <path
            d="M 60 60 m -46 0 a 46 46 0 1 1 92 0"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
            strokeLinecap="round"
            transform="rotate(-90, 60, 60)"
          />

          {/* Speed arc fill (cyan) */}
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="oklch(0.85 0.18 195)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${speedPercent * 289} 289`}
            strokeDashoffset="0"
            transform="rotate(225, 60, 60)"
            style={{ filter: "drop-shadow(0 0 4px oklch(0.85 0.18 195))" }}
          />

          {/* Tick marks */}
          {Array.from({ length: 11 }, (_, i) => {
            const deg = -135 + i * 27;
            const angle = deg * (Math.PI / 180);
            const inner = 46;
            const outer = 52;
            const x1 = 60 + inner * Math.cos(angle);
            const y1 = 60 + inner * Math.sin(angle);
            const x2 = 60 + outer * Math.cos(angle);
            const y2 = 60 + outer * Math.sin(angle);
            return (
              <line
                key={`tick-deg${deg}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={i % 5 === 0 ? 2 : 1}
              />
            );
          })}

          {/* Needle */}
          <line
            x1="60"
            y1="60"
            x2={60 + 36 * Math.cos((needleAngle - 90) * (Math.PI / 180))}
            y2={60 + 36 * Math.sin((needleAngle - 90) * (Math.PI / 180))}
            stroke="oklch(0.78 0.19 55)"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 3px oklch(0.78 0.19 55))" }}
          />

          {/* Center dot */}
          <circle cx="60" cy="60" r="4" fill="oklch(0.78 0.19 55)" />
        </svg>

        {/* Speed readout */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-3"
          style={{ pointerEvents: "none" }}
        >
          <span
            className="text-xl font-bold neon-cyan"
            style={{
              color: "oklch(0.85 0.18 195)",
              fontFamily: "Geist Mono, monospace",
              lineHeight: 1,
            }}
          >
            {speed}
          </span>
          <span
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}
          >
            KM/H
          </span>
        </div>
      </div>

      {/* Nitro bar */}
      <div className="w-full" style={{ width: 120 }}>
        <div className="flex justify-between items-center mb-1">
          <span
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "Geist Mono, monospace",
            }}
          >
            NOS
          </span>
          <span
            style={{
              fontSize: 9,
              color: isNitroActive
                ? "oklch(0.82 0.20 142)"
                : "rgba(255,255,255,0.3)",
              fontFamily: "Geist Mono, monospace",
            }}
          >
            {isNitroActive ? "BOOST" : `${Math.round(nitro)}%`}
          </span>
        </div>
        <div className="stat-bar">
          <div
            className={`stat-bar-fill ${isNitroActive ? "nitro-active" : ""}`}
            style={{
              width: `${nitro}%`,
              background: isNitroActive
                ? "oklch(0.82 0.20 142)"
                : nitro > 50
                  ? "oklch(0.85 0.18 195)"
                  : nitro > 25
                    ? "oklch(0.78 0.19 55)"
                    : "oklch(0.65 0.22 25)",
              boxShadow: isNitroActive
                ? "0 0 8px oklch(0.82 0.20 142)"
                : "none",
            }}
          />
        </div>
      </div>

      {/* Distance */}
      <div
        style={{
          fontFamily: "Geist Mono, monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          textAlign: "center",
        }}
      >
        <span style={{ color: "oklch(0.85 0.18 195)" }}>
          {distance.toLocaleString()}
        </span>
        <span> m</span>
      </div>
    </div>
  );
}
