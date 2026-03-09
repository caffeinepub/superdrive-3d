import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";

interface GameCameraProps {
  carPosition: React.MutableRefObject<THREE.Vector3>;
  carRotation: React.MutableRefObject<number>;
}

const THIRD_PERSON_OFFSET = new THREE.Vector3(0, 5.5, 12);
const INTERIOR_OFFSET = new THREE.Vector3(0, 1.1, 0.5);

export function GameCamera({ carPosition, carRotation }: GameCameraProps) {
  const { camera } = useThree();
  const { cameraMode, screen } = useGameStore();
  const targetPos = useRef(new THREE.Vector3(0, 5, 10));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (screen !== "playing") return;

    const pos = carPosition.current;
    const rot = carRotation.current;

    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);

    if (cameraMode === "third") {
      // Third person: behind and above car
      const offset = THIRD_PERSON_OFFSET.clone();
      const worldOffset = new THREE.Vector3(
        offset.x * cosR + offset.z * sinR,
        offset.y,
        -offset.x * sinR + offset.z * cosR,
      );

      const desiredPos = pos.clone().add(worldOffset);
      targetPos.current.lerp(desiredPos, 0.07);
      camera.position.copy(targetPos.current);

      // Look slightly ahead of car
      const lookAhead = new THREE.Vector3(-sinR * 8, 1.5, -cosR * 8);
      const lookTarget = pos.clone().add(lookAhead);
      targetLookAt.current.lerp(lookTarget, 0.1);
      camera.lookAt(targetLookAt.current);
    } else {
      // Interior: inside cockpit
      const interiorOffset = INTERIOR_OFFSET.clone();
      const worldOffset = new THREE.Vector3(
        interiorOffset.x * cosR + interiorOffset.z * sinR,
        interiorOffset.y,
        -interiorOffset.x * sinR + interiorOffset.z * cosR,
      );

      const desiredPos = pos.clone().add(worldOffset);
      camera.position.lerp(desiredPos, 0.15);

      // Look forward from cockpit
      const forwardDir = new THREE.Vector3(-sinR * 20, 0.8, -cosR * 20);
      const lookTarget = pos.clone().add(forwardDir);
      targetLookAt.current.lerp(lookTarget, 0.12);
      camera.lookAt(targetLookAt.current);
    }
  });

  return null;
}

// Separate hook for getting car refs to pass to camera
export function useCarRefs() {
  const posRef = useRef(new THREE.Vector3(0, 0.4, 0));
  const rotRef = useRef(0);
  return { posRef, rotRef };
}
