import { useEffect } from "react";
import { GameScene } from "./game/GameScene";
import { HUD } from "./game/HUD";
import { GarageScreen } from "./screens/GarageScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { PauseMenu } from "./screens/PauseMenu";
import { useGameStore } from "./store/gameStore";

export default function App() {
  const { screen } = useGameStore();

  // Handle Esc for pause from game
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const { screen: s, setScreen } = useGameStore.getState();
      if (e.key === "Escape") {
        if (s === "playing") setScreen("paused");
        else if (s === "paused") setScreen("playing");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className="dark"
      style={{ width: "100vw", height: "100dvh", overflow: "hidden" }}
    >
      {/* Garage screen */}
      {screen === "garage" && <GarageScreen />}

      {/* Leaderboard screen */}
      {screen === "leaderboard" && <LeaderboardScreen />}

      {/* Game canvas — persisted in DOM while playing or paused */}
      {(screen === "playing" || screen === "paused") && (
        <>
          <GameScene />
          <HUD />
          <PauseMenu />
        </>
      )}
    </div>
  );
}
