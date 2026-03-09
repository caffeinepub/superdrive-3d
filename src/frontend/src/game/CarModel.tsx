import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { CAR_DATA } from "../store/gameStore";

interface CarModelProps {
  carIndex: number;
  position?: [number, number, number];
  rotation?: number;
  scale?: number;
  isPlayer?: boolean;
  speed?: number;
}

export function CarModel({
  carIndex,
  position = [0, 0, 0],
  rotation = 0,
  scale = 1,
  speed = 0,
}: CarModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelRefs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ];

  const car = CAR_DATA[carIndex];
  const carColor = car.color;
  const accentColor = car.accentColor;

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.y = rotation;
    }
  }, [position, rotation]);

  useFrame((_, delta) => {
    // Rotate wheels based on speed
    const wheelRotationSpeed = speed * 0.05;
    for (const ref of wheelRefs) {
      if (ref.current) {
        ref.current.rotation.z += wheelRotationSpeed * delta * 60;
      }
    }
  });

  const wheelPositions: [number, number, number][] = [
    [-0.8, -0.25, 1.1], // front-left
    [0.8, -0.25, 1.1], // front-right
    [-0.8, -0.25, -1.1], // rear-left
    [0.8, -0.25, -1.1], // rear-right
  ];

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main body */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[1.8, 0.45, 4.2]} />
        <meshStandardMaterial
          color={carColor}
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Roof / cabin */}
      <mesh position={[0, 0.55, -0.15]} castShadow>
        <boxGeometry args={[1.55, 0.38, 2.0]} />
        <meshStandardMaterial
          color={carColor}
          metalness={0.7}
          roughness={0.25}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Front bumper */}
      <mesh position={[0, -0.05, 2.1]} castShadow>
        <boxGeometry args={[1.7, 0.3, 0.2]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Rear bumper */}
      <mesh position={[0, -0.05, -2.1]} castShadow>
        <boxGeometry args={[1.7, 0.3, 0.2]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Hood scoop */}
      <mesh position={[0, 0.38, 1.0]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.8]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 0.52, 0.85]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[1.45, 0.45, 0.08]} />
        <meshStandardMaterial
          color="#88CCFF"
          metalness={0.1}
          roughness={0.05}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Rear window */}
      <mesh position={[0, 0.52, -1.15]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[1.45, 0.4, 0.08]} />
        <meshStandardMaterial
          color="#88CCFF"
          metalness={0.1}
          roughness={0.05}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Headlights (emissive) */}
      <mesh position={[-0.55, 0.08, 2.15]}>
        <boxGeometry args={[0.35, 0.15, 0.05]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#AADDFF"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[0.55, 0.08, 2.15]}>
        <boxGeometry args={[0.35, 0.15, 0.05]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#AADDFF"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Tail lights */}
      <mesh position={[-0.55, 0.08, -2.15]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial
          color="#FF2200"
          emissive="#FF2200"
          emissiveIntensity={2.5}
        />
      </mesh>
      <mesh position={[0.55, 0.08, -2.15]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial
          color="#FF2200"
          emissive="#FF2200"
          emissiveIntensity={2.5}
        />
      </mesh>

      {/* Side mirrors */}
      <mesh position={[-0.98, 0.3, 0.7]}>
        <boxGeometry args={[0.1, 0.08, 0.2]} />
        <meshStandardMaterial
          color={carColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0.98, 0.3, 0.7]}>
        <boxGeometry args={[0.1, 0.08, 0.2]} />
        <meshStandardMaterial
          color={carColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Spoiler */}
      <mesh position={[0, 0.65, -2.0]}>
        <boxGeometry args={[1.6, 0.06, 0.3]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[-0.65, 0.45, -2.0]}>
        <boxGeometry args={[0.06, 0.4, 0.2]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0.65, 0.45, -2.0]}>
        <boxGeometry args={[0.06, 0.4, 0.2]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Underbody */}
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[1.6, 0.08, 3.8]} />
        <meshStandardMaterial color="#111111" metalness={0.3} roughness={0.8} />
      </mesh>

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static geometry positions
        <group key={i} position={pos}>
          {/* Tire */}
          <mesh ref={wheelRefs[i]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.22, 16]} />
            <meshStandardMaterial
              color="#1a1a1a"
              metalness={0.1}
              roughness={0.9}
            />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.24, 8]} />
            <meshStandardMaterial
              color="#888888"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          {/* Rim center */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.26, 6]} />
            <meshStandardMaterial
              color={accentColor}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Point light for headlights glow */}
      <pointLight
        position={[0, 0.1, 2.5]}
        color="#AADDFF"
        intensity={1.5}
        distance={8}
      />
    </group>
  );
}
