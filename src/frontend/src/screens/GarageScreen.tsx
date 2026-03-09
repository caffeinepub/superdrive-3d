import { ChevronRight, Gauge, Target, Trophy, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CAR_DATA, useGameStore } from "../store/gameStore";
import { audioManager } from "../utils/audioManager";

const carDescriptions = [
  "Italian sculpted aggression. The V10 wail is a symphony of controlled chaos.",
  "Prancing horse precision. Every curve engineered for pure driving ecstasy.",
  "Sixteen cylinders of absolute dominance. The apex of automotive achievement.",
  "Bavarian engineering meets M-division fury. Precision at any speed.",
];

export function GarageScreen() {
  const {
    selectedCar,
    setSelectedCar,
    playerName,
    setPlayerName,
    setScreen,
    resetGame,
  } = useGameStore();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartRace = () => {
    if (!playerName.trim()) return;
    setIsStarting(true);
    audioManager.resume();
    setTimeout(() => {
      resetGame();
      setScreen("playing");
      audioManager.startEngine();
      audioManager.startBackgroundMusic();
    }, 600);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "oklch(0.08 0.01 240)",
        fontFamily: "Mona Sans, sans-serif",
      }}
    >
      {/* Animated grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glowing stripe at top */}
      <div
        className="w-full h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.85 0.18 195), oklch(0.78 0.19 55), oklch(0.85 0.18 195), transparent)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        <div>
          <div
            className="text-3xl font-black tracking-widest"
            style={{
              fontFamily: "Cabinet Grotesk, sans-serif",
              color: "oklch(0.85 0.18 195)",
              textShadow: "0 0 30px oklch(0.85 0.18 195 / 0.4)",
              letterSpacing: "0.15em",
            }}
          >
            SUPERDRIVE
          </div>
          <div
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.3em",
              marginTop: 1,
            }}
          >
            3D RACING EXPERIENCE
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Trophy size={16} style={{ color: "oklch(0.78 0.19 55)" }} />
          <button
            type="button"
            onClick={() => setScreen("leaderboard")}
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 11,
              color: "oklch(0.78 0.19 55)",
              textDecoration: "none",
              letterSpacing: "0.1em",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            LEADERBOARD
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Section title */}
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 3,
              height: 24,
              background: "oklch(0.85 0.18 195)",
              boxShadow: "0 0 8px oklch(0.85 0.18 195)",
            }}
          />
          <span
            style={{
              fontFamily: "Cabinet Grotesk, sans-serif",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            SELECT YOUR MACHINE
          </span>
        </div>

        {/* Car cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CAR_DATA.map((car, i) => (
            <motion.button
              key={car.name}
              data-ocid={`garage.car.item.${i + 1}` as string}
              className={`car-card p-4 text-left rounded ${i === selectedCar ? "selected" : ""}`}
              onClick={() => setSelectedCar(i)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              {/* Car visual */}
              <div
                className="relative mb-3 overflow-hidden"
                style={{ height: 80, borderRadius: 4 }}
              >
                {/* Car silhouette (CSS art) */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at 50% 80%, ${car.color}22 0%, transparent 70%)`,
                  }}
                />
                <CarSilhouette
                  color={car.color}
                  accentColor={car.accentColor}
                  index={i}
                />

                {/* Brand badge */}
                <div
                  className="absolute top-1 right-1 px-1.5 py-0.5"
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    borderRadius: 2,
                    fontSize: 8,
                    fontFamily: "Geist Mono, monospace",
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {car.brand.toUpperCase()}
                </div>
              </div>

              {/* Car name */}
              <div
                className="font-bold mb-1"
                style={{
                  fontFamily: "Cabinet Grotesk, sans-serif",
                  fontSize: 13,
                  color:
                    i === selectedCar
                      ? "oklch(0.85 0.18 195)"
                      : "rgba(255,255,255,0.85)",
                  letterSpacing: "0.02em",
                }}
              >
                {car.name}
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-1.5 mt-2">
                <StatBar
                  icon={<Gauge size={9} />}
                  label="SPEED"
                  value={car.topSpeed}
                  max={440}
                  color="oklch(0.85 0.18 195)"
                />
                <StatBar
                  icon={<Zap size={9} />}
                  label="ACCEL"
                  value={car.acceleration}
                  max={10}
                  color="oklch(0.78 0.19 55)"
                />
                <StatBar
                  icon={<Target size={9} />}
                  label="GRIP"
                  value={car.handling}
                  max={10}
                  color="oklch(0.82 0.20 142)"
                />
              </div>

              {/* Top speed badge */}
              <div
                className="mt-2"
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                TOP:{" "}
                <span style={{ color: "oklch(0.85 0.18 195)" }}>
                  {car.topSpeed}
                </span>{" "}
                km/h
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selected car description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCar}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="glass-panel px-4 py-3"
            style={{ borderRadius: 4 }}
          >
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              "{carDescriptions[selectedCar]}"
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Player name + start */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 relative">
            <input
              data-ocid="garage.name_input"
              type="text"
              placeholder="ENTER YOUR NAME"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && playerName.trim() && handleStartRace()
              }
              maxLength={20}
              className="w-full px-4 py-3"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.85 0.18 195 / 0.3)",
                borderRadius: 4,
                color: "oklch(0.85 0.18 195)",
                fontFamily: "Geist Mono, monospace",
                fontSize: 13,
                letterSpacing: "0.15em",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "oklch(0.85 0.18 195)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 1px oklch(0.85 0.18 195), 0 0 15px oklch(0.85 0.18 195 / 0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor =
                  "oklch(0.85 0.18 195 / 0.3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <motion.button
            data-ocid="garage.play_button"
            onClick={handleStartRace}
            disabled={!playerName.trim() || isStarting}
            whileHover={{ scale: playerName.trim() ? 1.02 : 1 }}
            whileTap={{ scale: playerName.trim() ? 0.97 : 1 }}
            className="flex items-center justify-center gap-2 px-8 py-3 font-black"
            style={{
              background: playerName.trim()
                ? "oklch(0.85 0.18 195)"
                : "oklch(0.20 0 0)",
              color: playerName.trim()
                ? "oklch(0.08 0 0)"
                : "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: 4,
              fontFamily: "Cabinet Grotesk, sans-serif",
              fontSize: 16,
              letterSpacing: "0.15em",
              cursor: playerName.trim() ? "pointer" : "not-allowed",
              boxShadow: playerName.trim()
                ? "0 0 20px oklch(0.85 0.18 195 / 0.4)"
                : "none",
              transition: "all 0.2s",
              minWidth: 160,
            }}
          >
            {isStarting ? (
              <span
                style={{ fontFamily: "Geist Mono, monospace", fontSize: 12 }}
              >
                IGNITION...
              </span>
            ) : (
              <>
                <span>RACE</span>
                <ChevronRight size={18} />
              </>
            )}
          </motion.button>
        </div>

        {/* Controls hint */}
        <div
          className="text-center"
          style={{
            fontFamily: "Geist Mono, monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.15em",
          }}
        >
          WASD / ↑↓←→ DRIVE • SPACE BRAKE • SHIFT NITRO • C CAMERA • ESC PAUSE
        </div>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-3"
        style={{
          fontFamily: "Geist Mono, monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.2)",
        }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "oklch(0.85 0.18 195 / 0.5)",
            textDecoration: "none",
          }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon?: React.ReactNode;
}) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: "rgba(255,255,255,0.3)", width: 9 }}>{icon}</span>
      <span
        style={{
          fontFamily: "Geist Mono, monospace",
          fontSize: 8,
          color: "rgba(255,255,255,0.35)",
          width: 32,
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </span>
      <div className="flex-1 stat-bar">
        <div
          className="stat-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// CSS car silhouette for garage cards
function CarSilhouette({
  color,
  accentColor,
  index,
}: { color: string; accentColor: string; index: number }) {
  const shapes = [
    // Lamborghini - angular/low
    { bodyH: 18, roofH: 10, roofW: 60, bodyY: 50, spoiler: true },
    // Ferrari - sleek
    { bodyH: 20, roofH: 12, roofW: 55, bodyY: 48, spoiler: false },
    // Bugatti - wide/muscular
    { bodyH: 22, roofH: 11, roofW: 58, bodyY: 46, spoiler: true },
    // BMW - classic/sporty
    { bodyH: 21, roofH: 14, roofW: 52, bodyY: 47, spoiler: false },
  ];
  const s = shapes[index];

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 120 80"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <title>Car Silhouette</title>
      {/* Shadow */}
      <ellipse cx="60" cy="72" rx="48" ry="4" fill="rgba(0,0,0,0.4)" />
      {/* Body */}
      <rect
        x="8"
        y={s.bodyY}
        width="104"
        height={s.bodyH}
        rx="4"
        fill={color}
      />
      {/* Roof */}
      <rect
        x={(120 - s.roofW) / 2}
        y={s.bodyY - s.roofH}
        width={s.roofW}
        height={s.roofH + 4}
        rx="4"
        fill={color}
      />
      {/* Spoiler */}
      {s.spoiler && (
        <rect
          x="8"
          y={s.bodyY - 8}
          width="8"
          height="3"
          rx="1"
          fill={accentColor}
        />
      )}
      {/* Front bumper */}
      <rect
        x="100"
        y={s.bodyY + 4}
        width="12"
        height={s.bodyH - 8}
        rx="2"
        fill={accentColor}
      />
      {/* Headlight */}
      <rect
        x="108"
        y={s.bodyY + 5}
        width="6"
        height="5"
        rx="1"
        fill="rgba(200,220,255,0.9)"
      />
      {/* Taillight */}
      <rect
        x="4"
        y={s.bodyY + 5}
        width="6"
        height="5"
        rx="1"
        fill="rgba(255,60,0,0.9)"
      />
      {/* Wheels */}
      <circle cx="25" cy={s.bodyY + s.bodyH - 2} r="9" fill="#1a1a1a" />
      <circle cx="25" cy={s.bodyY + s.bodyH - 2} r="5" fill="#444" />
      <circle cx="95" cy={s.bodyY + s.bodyH - 2} r="9" fill="#1a1a1a" />
      <circle cx="95" cy={s.bodyY + s.bodyH - 2} r="5" fill="#444" />
      {/* Windshield */}
      <polygon
        points={`${(120 - s.roofW) / 2 + s.roofW * 0.05},${s.bodyY} ${(120 - s.roofW) / 2 + s.roofW * 0.3},${s.bodyY - s.roofH + 2} ${(120 - s.roofW) / 2 + s.roofW * 0.7},${s.bodyY - s.roofH + 2} ${(120 - s.roofW) / 2 + s.roofW * 0.9},${s.bodyY}`}
        fill="rgba(100,180,255,0.25)"
      />
    </svg>
  );
}
