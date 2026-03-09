import { Home, Play, Trophy, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { audioManager } from "../utils/audioManager";

export function PauseMenu() {
  const { screen, setScreen } = useGameStore();
  const [muted, setMuted] = useState(false);
  const isVisible = screen === "paused";

  const handleResume = () => setScreen("playing");

  const handleGarage = () => {
    audioManager.stopEngine();
    audioManager.stopBackgroundMusic();
    setScreen("garage");
  };

  const handleLeaderboard = () => {
    audioManager.stopEngine();
    audioManager.stopBackgroundMusic();
    setScreen("leaderboard");
  };

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    audioManager.setMuted(newMuted);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center gap-6 px-8 py-8 relative"
            style={{
              background: "oklch(0.10 0.01 240)",
              border: "1px solid oklch(0.85 0.18 195 / 0.3)",
              borderRadius: 8,
              minWidth: 280,
              boxShadow: "0 0 60px oklch(0.85 0.18 195 / 0.1)",
            }}
          >
            {/* Top accent */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2"
              style={{
                width: "60%",
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, oklch(0.85 0.18 195), transparent)",
              }}
            />

            {/* Title */}
            <div className="text-center">
              <div
                style={{
                  fontFamily: "Cabinet Grotesk, sans-serif",
                  fontWeight: 900,
                  fontSize: 28,
                  color: "oklch(0.85 0.18 195)",
                  letterSpacing: "0.2em",
                  textShadow: "0 0 20px oklch(0.85 0.18 195 / 0.5)",
                }}
              >
                PAUSED
              </div>
              <div
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.3em",
                  marginTop: 4,
                }}
              >
                PRESS ESC TO RESUME
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <PauseButton
                data-ocid="pause.resume_button"
                icon={<Play size={16} />}
                label="RESUME"
                onClick={handleResume}
                primary
              />
              <PauseButton
                data-ocid="pause.leaderboard_button"
                icon={<Trophy size={16} />}
                label="LEADERBOARD"
                onClick={handleLeaderboard}
              />
              <PauseButton
                data-ocid="pause.garage_button"
                icon={<Home size={16} />}
                label="GARAGE"
                onClick={handleGarage}
              />
            </div>

            {/* Mute toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className="flex items-center gap-2"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "Geist Mono, monospace",
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.1em",
              }}
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {muted ? "UNMUTE" : "MUTE"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PauseButton({
  icon,
  label,
  onClick,
  primary = false,
  "data-ocid": dataOcid,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  "data-ocid"?: string;
}) {
  return (
    <motion.button
      data-ocid={dataOcid}
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 3 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 px-5 py-3 w-full"
      style={{
        background: primary ? "oklch(0.85 0.18 195)" : "oklch(0.15 0 0)",
        border: primary ? "none" : "1px solid oklch(0.85 0.18 195 / 0.2)",
        borderRadius: 4,
        color: primary ? "oklch(0.08 0 0)" : "rgba(255,255,255,0.7)",
        fontFamily: "Cabinet Grotesk, sans-serif",
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: "0.15em",
        cursor: "pointer",
        boxShadow: primary ? "0 0 20px oklch(0.85 0.18 195 / 0.3)" : "none",
        transition: "background 0.15s",
      }}
    >
      <span style={{ opacity: primary ? 1 : 0.6 }}>{icon}</span>
      {label}
    </motion.button>
  );
}
