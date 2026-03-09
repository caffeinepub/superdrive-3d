import { Pause } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { CAR_DATA, useGameStore } from "../store/gameStore";
import { MiniMap } from "./MiniMap";
import { Speedometer } from "./Speedometer";
import { TouchControls } from "./TouchControls";

export function HUD() {
  const { selectedCar, cameraMode, setCameraMode, setScreen, screen } =
    useGameStore();
  const car = CAR_DATA[selectedCar];
  const isMobile = useIsMobile();

  // C key: toggle camera
  const handleCameraToggle = useCallback(() => {
    setCameraMode(cameraMode === "third" ? "interior" : "third");
  }, [cameraMode, setCameraMode]);

  // Esc: pause
  const handlePause = useCallback(() => {
    if (screen === "playing") setScreen("paused");
  }, [screen, setScreen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C") handleCameraToggle();
      if (e.key === "Escape") handlePause();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleCameraToggle, handlePause]);

  if (screen !== "playing") return null;

  return (
    <div className="hud-overlay">
      {/* Top-left: car name + camera mode */}
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <div className="glass-panel px-3 py-1.5" style={{ borderRadius: 4 }}>
          <div
            style={{
              fontFamily: "Cabinet Grotesk, sans-serif",
              fontWeight: 800,
              fontSize: 13,
              color: "oklch(0.85 0.18 195)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {car.brand}
          </div>
          <div
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {car.name}
          </div>
        </div>

        {/* Camera indicator */}
        <button
          type="button"
          onClick={handleCameraToggle}
          className="glass-panel px-2 py-1 text-left"
          style={{ borderRadius: 4, cursor: "pointer" }}
          title="Press C to toggle camera"
        >
          <span
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            CAM:{" "}
            <span style={{ color: "oklch(0.78 0.19 55)" }}>
              {cameraMode === "third" ? "3RD" : "INT"}
            </span>
          </span>
        </button>
      </div>

      {/* Top-right: pause button */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          data-ocid="hud.pause_button"
          onClick={handlePause}
          className="glass-panel p-2.5 hover:bg-white/10 transition-colors"
          style={{ borderRadius: 4, cursor: "pointer" }}
        >
          <Pause size={18} style={{ color: "oklch(0.85 0.18 195)" }} />
        </button>
      </div>

      {/* Controls hint (desktop only) */}
      {!isMobile && (
        <div
          className="absolute top-1/2 right-4 -translate-y-1/2 glass-panel px-3 py-2 flex flex-col gap-0.5"
          style={{ borderRadius: 4, opacity: 0.6 }}
        >
          {[
            ["W / ↑", "Accelerate"],
            ["S / ↓", "Reverse"],
            ["A / ←", "Left"],
            ["D / →", "Right"],
            ["SPACE", "Brake"],
            ["SHIFT", "Nitro"],
            ["C", "Camera"],
            ["ESC", "Pause"],
          ].map(([key, action]) => (
            <div key={key} className="flex gap-2 items-center">
              <span
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 9,
                  color: "oklch(0.78 0.19 55)",
                  minWidth: 40,
                }}
              >
                {key}
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
                {action}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom-right: speedometer */}
      <div className="absolute bottom-6 right-4">
        <div className="glass-panel p-3" style={{ borderRadius: 6 }}>
          <Speedometer />
        </div>
      </div>

      {/* Bottom-left: minimap */}
      <div className="absolute bottom-6 left-4">
        <MiniMap />
      </div>

      {/* Mobile touch controls */}
      {isMobile && <TouchControls />}
    </div>
  );
}
