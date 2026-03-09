import { create } from "zustand";

export type GameScreen = "garage" | "playing" | "paused" | "leaderboard";
export type CameraMode = "third" | "interior";

export interface CarStats {
  name: string;
  brand: string;
  topSpeed: number; // km/h
  acceleration: number; // 1-10
  handling: number; // 1-10
  color: string;
  accentColor: string;
  nitroColor: string;
}

export const CAR_DATA: CarStats[] = [
  {
    name: "Huracan EVO",
    brand: "Lamborghini",
    topSpeed: 325,
    acceleration: 9,
    handling: 8,
    color: "#E8C419",
    accentColor: "#1a1a1a",
    nitroColor: "#FFD700",
  },
  {
    name: "488 Pista",
    brand: "Ferrari",
    topSpeed: 340,
    acceleration: 10,
    handling: 9,
    color: "#CC0000",
    accentColor: "#FF4444",
    nitroColor: "#FF6600",
  },
  {
    name: "Chiron Super",
    brand: "Bugatti",
    topSpeed: 440,
    acceleration: 10,
    handling: 7,
    color: "#1A2B8F",
    accentColor: "#4488FF",
    nitroColor: "#00AAFF",
  },
  {
    name: "M5 Competition",
    brand: "BMW",
    topSpeed: 305,
    acceleration: 8,
    handling: 10,
    color: "#2A2A2A",
    accentColor: "#0066CC",
    nitroColor: "#00FFCC",
  },
];

interface GameState {
  // Screens
  screen: GameScreen;
  setScreen: (s: GameScreen) => void;

  // Garage
  selectedCar: number;
  setSelectedCar: (i: number) => void;
  playerName: string;
  setPlayerName: (n: string) => void;

  // In-game state
  speed: number;
  setSpeed: (s: number) => void;
  nitro: number;
  setNitro: (n: number) => void;
  isNitroActive: boolean;
  setNitroActive: (a: boolean) => void;
  distance: number;
  setDistance: (d: number) => void;
  cameraMode: CameraMode;
  setCameraMode: (m: CameraMode) => void;

  // Keys held
  keys: Set<string>;
  pressKey: (k: string) => void;
  releaseKey: (k: string) => void;

  // Score submitted
  scoreSubmitted: boolean;
  setScoreSubmitted: (v: boolean) => void;

  // Reset game
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  screen: "garage",
  setScreen: (screen) => set({ screen }),

  selectedCar: 0,
  setSelectedCar: (selectedCar) => set({ selectedCar }),

  playerName: "",
  setPlayerName: (playerName) => set({ playerName }),

  speed: 0,
  setSpeed: (speed) => set({ speed }),

  nitro: 100,
  setNitro: (nitro) => set({ nitro }),

  isNitroActive: false,
  setNitroActive: (isNitroActive) => set({ isNitroActive }),

  distance: 0,
  setDistance: (distance) => set({ distance }),

  cameraMode: "third",
  setCameraMode: (cameraMode) => set({ cameraMode }),

  keys: new Set<string>(),
  pressKey: (k) =>
    set((state) => {
      const keys = new Set(state.keys);
      keys.add(k);
      return { keys };
    }),
  releaseKey: (k) =>
    set((state) => {
      const keys = new Set(state.keys);
      keys.delete(k);
      return { keys };
    }),

  scoreSubmitted: false,
  setScoreSubmitted: (scoreSubmitted) => set({ scoreSubmitted }),

  resetGame: () =>
    set({
      speed: 0,
      nitro: 100,
      isNitroActive: false,
      distance: 0,
      cameraMode: "third",
      keys: new Set<string>(),
      scoreSubmitted: false,
    }),
}));
