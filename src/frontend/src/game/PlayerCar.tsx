import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CAR_DATA, useGameStore } from "../store/gameStore";
import { audioManager } from "../utils/audioManager";
import { CarModel } from "./CarModel";

// Physics constants
const FRICTION = 0.96;
const TURN_SPEED = 1.8;
const BRAKE_FORCE = 0.88;
const NITRO_MULTIPLIER = 2.8;
const WORLD_BOUND = 490;

export interface PlayerCarHandle {
  getPosition: () => THREE.Vector3;
  getRotation: () => number;
  getVelocity: () => THREE.Vector3;
}

interface PlayerCarProps {
  onRef?: (handle: PlayerCarHandle) => void;
}

export function PlayerCar({ onRef }: PlayerCarProps) {
  const {
    selectedCar,
    keys,
    setSpeed,
    setNitro,
    setNitroActive,
    setDistance,
    screen,
  } = useGameStore();

  const car = CAR_DATA[selectedCar];
  const groupRef = useRef<THREE.Group>(null);

  // Physics state (use refs for performance in useFrame)
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const carRotation = useRef(0);
  const nitroRef = useRef(100);
  const speedRef = useRef(0);
  const distanceRef = useRef(0);
  const lastSkidTime = useRef(0);

  // Max speed in world units/sec (scales with car stats)
  const maxSpeed = (car.topSpeed / 100) * 0.8; // tuned for world scale
  const accelForce = 0.015 + (car.acceleration / 10) * 0.02;
  const handleFactor = 0.8 + (car.handling / 10) * 0.4;

  useEffect(() => {
    if (onRef && groupRef.current) {
      onRef({
        getPosition: () => {
          const pos = groupRef.current?.position ?? new THREE.Vector3();
          return pos.clone();
        },
        getRotation: () => carRotation.current,
        getVelocity: () => velocity.current.clone(),
      });
    }
  });

  useFrame((_, delta) => {
    if (screen !== "playing" || !groupRef.current) return;

    const dt = Math.min(delta, 0.05); // cap delta for stability

    const isForward = keys.has("ArrowUp") || keys.has("w") || keys.has("W");
    const isBack = keys.has("ArrowDown") || keys.has("s") || keys.has("S");
    const isLeft = keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
    const isRight = keys.has("ArrowRight") || keys.has("d") || keys.has("D");
    const isBrake = keys.has(" ") || keys.has("Space");
    const isNitro =
      (keys.has("Shift") || keys.has("ShiftLeft") || keys.has("ShiftRight")) &&
      nitroRef.current > 0;

    const currentSpeed = velocity.current.length();
    speedRef.current = currentSpeed;

    // Steering (only when moving)
    if (currentSpeed > 0.05) {
      const turnDir = (isLeft ? 1 : 0) - (isRight ? 1 : 0);
      const speedFactor = Math.min(currentSpeed / 5, 1.0);
      const turning = turnDir * TURN_SPEED * handleFactor * speedFactor * dt;
      carRotation.current += turning;
      groupRef.current.rotation.y = carRotation.current;
    }

    // Forward vector based on car rotation
    const forward = new THREE.Vector3(
      -Math.sin(carRotation.current),
      0,
      -Math.cos(carRotation.current),
    );

    // Acceleration
    if (isForward) {
      const nitroMult = isNitro ? NITRO_MULTIPLIER : 1;
      const accel = forward.clone().multiplyScalar(accelForce * nitroMult);
      velocity.current.add(accel);
    }

    if (isBack) {
      const decelForce = accelForce * 0.6;
      velocity.current.add(forward.clone().multiplyScalar(-decelForce));
    }

    // Brake
    if (isBrake) {
      velocity.current.multiplyScalar(BRAKE_FORCE);
      if (currentSpeed > 2 && Date.now() - lastSkidTime.current > 200) {
        audioManager.playSkid(Math.min(currentSpeed / maxSpeed, 1));
        lastSkidTime.current = Date.now();
      }
    } else {
      // Natural friction
      velocity.current.multiplyScalar(FRICTION);
    }

    // Clamp to max speed
    if (velocity.current.length() > maxSpeed) {
      velocity.current.normalize().multiplyScalar(maxSpeed);
    }

    // Keep car aligned to forward direction (simulate grip)
    if (currentSpeed > 0.1) {
      const alignment = velocity.current.clone().normalize();
      const targetDir = isBack ? forward.clone().negate() : forward.clone();
      const lerpFactor = handleFactor * 0.15;
      alignment.lerp(targetDir, lerpFactor);
      velocity.current = alignment.multiplyScalar(velocity.current.length());
    }

    // Apply movement
    groupRef.current.position.add(
      velocity.current.clone().multiplyScalar(dt * 60),
    );

    // World bounds
    groupRef.current.position.x = Math.max(
      -WORLD_BOUND,
      Math.min(WORLD_BOUND, groupRef.current.position.x),
    );
    groupRef.current.position.z = Math.max(
      -WORLD_BOUND,
      Math.min(WORLD_BOUND, groupRef.current.position.z),
    );
    groupRef.current.position.y = 0.38; // keep on ground

    // Nitro management
    if (isNitro && isForward) {
      nitroRef.current = Math.max(0, nitroRef.current - dt * 25);
      setNitroActive(true);
    } else {
      nitroRef.current = Math.min(100, nitroRef.current + dt * 8);
      setNitroActive(false);
    }

    // Distance
    const moveDist = velocity.current.length() * dt * 60;
    distanceRef.current += moveDist;

    // Update store (throttled to avoid too many re-renders)
    const kmh = currentSpeed * 60 * 3.6 * 0.5;
    setSpeed(Math.round(kmh));
    setNitro(Math.round(nitroRef.current));
    setDistance(Math.round(distanceRef.current * 0.5)); // rough meters

    // Update audio
    audioManager.updateEngine(kmh, isNitro);
  });

  return (
    <group ref={groupRef} position={[0, 0.38, 0]}>
      <CarModel carIndex={selectedCar} speed={speedRef.current} />
      {/* Nitro exhaust glow */}
      <pointLight
        position={[0, 0, -2.3]}
        color={car.nitroColor}
        intensity={useGameStore.getState().isNitroActive ? 3 : 0}
        distance={6}
      />
    </group>
  );
}
