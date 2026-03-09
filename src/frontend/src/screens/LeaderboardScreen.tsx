import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Medal, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useActor } from "../hooks/useActor";
import { CAR_DATA, useGameStore } from "../store/gameStore";

export function LeaderboardScreen() {
  const {
    setScreen,
    playerName,
    distance,
    selectedCar,
    scoreSubmitted,
    setScoreSubmitted,
  } = useGameStore();
  const { actor, isFetching } = useActor();
  const hasAttemptedSubmit = useRef(false);

  // Fetch top scores
  const {
    data: scores,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["topScores"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopScores(BigInt(10));
    },
    enabled: !!actor && !isFetching,
  });

  // Submit score mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !playerName.trim() || scoreSubmitted) return;
      await actor.submitScore(playerName, distance, BigInt(selectedCar));
    },
    onSuccess: () => {
      setScoreSubmitted(true);
      refetch();
    },
  });

  // Auto-submit score if we came from a game (once only)
  useEffect(() => {
    if (
      actor &&
      !isFetching &&
      distance > 0 &&
      !scoreSubmitted &&
      playerName.trim() &&
      !hasAttemptedSubmit.current
    ) {
      hasAttemptedSubmit.current = true;
      submitMutation.mutate();
    }
  }, [actor, isFetching, distance, scoreSubmitted, playerName, submitMutation]);

  const medalColors = [
    "oklch(0.78 0.19 55)", // Gold
    "oklch(0.70 0.05 250)", // Silver
    "oklch(0.65 0.12 40)", // Bronze
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "oklch(0.08 0.01 240)",
        fontFamily: "Mona Sans, sans-serif",
      }}
    >
      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,200,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="w-full h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.85 0.18 195), oklch(0.78 0.19 55), transparent)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setScreen("garage")}
            className="p-2"
            style={{
              background: "oklch(0.15 0 0)",
              border: "1px solid oklch(0.85 0.18 195 / 0.3)",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={18} style={{ color: "oklch(0.85 0.18 195)" }} />
          </button>

          <div>
            <div
              style={{
                fontFamily: "Cabinet Grotesk, sans-serif",
                fontWeight: 900,
                fontSize: 24,
                color: "oklch(0.85 0.18 195)",
                letterSpacing: "0.15em",
                textShadow: "0 0 20px oklch(0.85 0.18 195 / 0.3)",
              }}
            >
              LEADERBOARD
            </div>
            <div
              style={{
                fontFamily: "Geist Mono, monospace",
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.2em",
              }}
            >
              TOP DRIVERS WORLDWIDE
            </div>
          </div>

          <Trophy
            size={28}
            className="ml-auto"
            style={{ color: "oklch(0.78 0.19 55)" }}
          />
        </div>

        {/* Current session score */}
        {distance > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 flex items-center gap-4"
            style={{
              background: "oklch(0.12 0.02 195)",
              border: "1px solid oklch(0.85 0.18 195 / 0.4)",
              borderRadius: 4,
            }}
          >
            <Zap size={16} style={{ color: "oklch(0.85 0.18 195)" }} />
            <div>
              <div
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.1em",
                }}
              >
                YOUR SESSION
              </div>
              <div
                style={{
                  fontFamily: "Cabinet Grotesk, sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "oklch(0.85 0.18 195)",
                }}
              >
                {playerName} — {distance.toLocaleString()} m
              </div>
            </div>
            <div
              className="ml-auto px-2 py-1"
              style={{
                background: `${CAR_DATA[selectedCar].color}22`,
                border: `1px solid ${CAR_DATA[selectedCar].color}44`,
                borderRadius: 3,
                fontFamily: "Geist Mono, monospace",
                fontSize: 10,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {CAR_DATA[selectedCar].name}
            </div>
          </motion.div>
        )}

        {/* Scores panel */}
        <div
          data-ocid="leaderboard.panel"
          className="flex flex-col"
          style={{
            background: "oklch(0.11 0 0)",
            border: "1px solid oklch(0.85 0.18 195 / 0.15)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            className="px-4 py-2.5 flex items-center gap-4"
            style={{
              borderBottom: "1px solid oklch(0.85 0.18 195 / 0.1)",
              background: "oklch(0.13 0.01 240)",
            }}
          >
            {["#", "DRIVER", "CAR", "DISTANCE"].map((h, i) => (
              <span
                key={h}
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.2em",
                  flex: i === 1 ? 1 : i === 3 ? "none" : "none",
                  minWidth: i === 0 ? 28 : i === 2 ? 80 : i === 3 ? 80 : "auto",
                  textAlign: i === 3 ? "right" : "left",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Loading */}
          {(isLoading || isFetching) && (
            <div
              className="py-8 text-center"
              data-ocid="leaderboard.loading_state"
            >
              <div
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.2em",
                }}
              >
                LOADING...
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isFetching && (!scores || scores.length === 0) && (
            <div
              className="py-10 text-center"
              data-ocid="leaderboard.empty_state"
            >
              <Trophy
                size={32}
                style={{ color: "rgba(255,255,255,0.1)", margin: "0 auto 8px" }}
              />
              <div
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.25)",
                  letterSpacing: "0.15em",
                }}
              >
                BE THE FIRST TO RACE
              </div>
            </div>
          )}

          {/* Score rows */}
          {scores?.map((score, i) => {
            const carIdx = Number(score.carIndex);
            const car = CAR_DATA[Math.min(carIdx, CAR_DATA.length - 1)];
            const isTop3 = i < 3;

            return (
              <motion.div
                key={`${score.name}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-3 flex items-center gap-4"
                style={{
                  borderBottom:
                    i < scores.length - 1
                      ? "1px solid oklch(0.85 0.18 195 / 0.05)"
                      : "none",
                  background:
                    i === 0 ? "oklch(0.78 0.19 55 / 0.05)" : "transparent",
                }}
              >
                {/* Rank */}
                <div style={{ minWidth: 28 }}>
                  {isTop3 ? (
                    <Medal size={16} style={{ color: medalColors[i] }} />
                  ) : (
                    <span
                      style={{
                        fontFamily: "Geist Mono, monospace",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.25)",
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div
                  className="flex-1"
                  style={{
                    fontFamily: "Cabinet Grotesk, sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color:
                      i === 0 ? "oklch(0.78 0.19 55)" : "rgba(255,255,255,0.8)",
                  }}
                >
                  {score.name}
                </div>

                {/* Car */}
                <div
                  style={{
                    minWidth: 80,
                    fontFamily: "Geist Mono, monospace",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{ background: car.color }}
                  />
                  {car.name.split(" ")[0]}
                </div>

                {/* Distance */}
                <div
                  style={{
                    minWidth: 80,
                    textAlign: "right",
                    fontFamily: "Geist Mono, monospace",
                    fontSize: 13,
                    color: isTop3 ? medalColors[i] : "rgba(255,255,255,0.6)",
                    fontWeight: isTop3 ? "bold" : "normal",
                  }}
                >
                  {Math.round(score.bestDistance).toLocaleString()}
                  <span
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.3)",
                      marginLeft: 2,
                    }}
                  >
                    m
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Back button */}
        <motion.button
          onClick={() => setScreen("garage")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="py-3 px-6 w-full"
          style={{
            background: "oklch(0.85 0.18 195)",
            border: "none",
            borderRadius: 4,
            color: "oklch(0.08 0 0)",
            fontFamily: "Cabinet Grotesk, sans-serif",
            fontWeight: 900,
            fontSize: 14,
            letterSpacing: "0.15em",
            cursor: "pointer",
            boxShadow: "0 0 20px oklch(0.85 0.18 195 / 0.3)",
          }}
        >
          BACK TO GARAGE
        </motion.button>
      </div>
    </div>
  );
}
