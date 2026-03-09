import { Sky, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
import { audioManager } from "../utils/audioManager";
import { CityWorld } from "./CityWorld";
import { GameCamera } from "./GameCamera";
import { PlayerCar } from "./PlayerCar";
import { TrafficCars } from "./TrafficCars";

function SceneLighting() {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.3} color="#334466" />
      <directionalLight
        ref={sunRef}
        position={[100, 80, 50]}
        intensity={1.2}
        color="#FFF5E0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={300}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      <hemisphereLight color="#112233" groundColor="#221100" intensity={0.4} />
    </>
  );
}

interface WorldBridgeProps {
  carPositionRef: React.MutableRefObject<THREE.Vector3>;
  carRotationRef: React.MutableRefObject<number>;
}

function WorldBridge({ carPositionRef, carRotationRef }: WorldBridgeProps) {
  const handleCarRef = useCallback(
    (handle: {
      getPosition: () => THREE.Vector3;
      getRotation: () => number;
    }) => {
      // Update refs every frame via handle
      const update = () => {
        carPositionRef.current.copy(handle.getPosition());
        carRotationRef.current = handle.getRotation();
        rafId = requestAnimationFrame(update);
      };
      let rafId = requestAnimationFrame(update);
      return () => cancelAnimationFrame(rafId);
    },
    [carPositionRef, carRotationRef],
  );

  return <PlayerCar onRef={handleCarRef} />;
}

export function GameScene() {
  const { screen, pressKey, releaseKey } = useGameStore();
  const carPositionRef = useRef(new THREE.Vector3(0, 0.4, 0));
  const carRotationRef = useRef(0);

  // Keyboard input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Prevent page scroll on arrow/space keys
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
      pressKey(e.key);
      // Start audio on first interaction
      audioManager.resume();
    };
    const up = (e: KeyboardEvent) => releaseKey(e.key);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [pressKey, releaseKey]);

  // Start engine audio when playing
  useEffect(() => {
    if (screen === "playing") {
      audioManager.startEngine();
    } else {
      audioManager.stopEngine();
    }
  }, [screen]);

  if (screen !== "playing" && screen !== "paused") return null;

  return (
    <div className="game-canvas">
      <Canvas
        camera={{ fov: 65, near: 0.1, far: 500, position: [0, 5, 10] }}
        shadows
        gl={
          {
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
            shadowMap: {
              enabled: true,
              type: THREE.PCFSoftShadowMap,
            },
          } as Parameters<typeof Canvas>[0]["gl"]
        }
        style={{ background: "#050510" }}
      >
        <Suspense fallback={null}>
          {/* Sky */}
          <Sky
            distance={450000}
            sunPosition={[0.5, 0.1, -1]}
            inclination={0.6}
            azimuth={0.25}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            rayleigh={0.5}
          />

          {/* Stars visible at night/dusk */}
          <Stars radius={300} depth={60} count={3000} factor={4} fade />

          {/* Lighting */}
          <SceneLighting />

          {/* World */}
          <CityWorld />

          {/* Traffic */}
          <TrafficCars />

          {/* Player */}
          <WorldBridge
            carPositionRef={carPositionRef}
            carRotationRef={carRotationRef}
          />

          {/* Camera controller */}
          <GameCamera
            carPosition={carPositionRef}
            carRotation={carRotationRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
