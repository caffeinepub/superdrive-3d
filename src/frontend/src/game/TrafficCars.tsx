import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const ROAD_SPACING = 78; // block + road width
const TRAFFIC_COLORS = [
  "#CCCCCC",
  "#FFFFFF",
  "#4488AA",
  "#AA4422",
  "#AAAAAA",
  "#334455",
];

interface TrafficCar {
  id: number;
  waypointIndex: number;
  progress: number; // 0-1 along current segment
  speed: number;
  colorIndex: number;
  lane: number; // +1 or -1 for direction
}

// Generate waypoints along roads
function generateWaypoints() {
  const routes: THREE.Vector3[][] = [];

  // Horizontal routes
  for (let row = -2; row <= 2; row++) {
    const z = row * ROAD_SPACING;
    routes.push([
      new THREE.Vector3(-400, 0.4, z),
      new THREE.Vector3(-200, 0.4, z),
      new THREE.Vector3(0, 0.4, z),
      new THREE.Vector3(200, 0.4, z),
      new THREE.Vector3(400, 0.4, z),
    ]);
    // Reverse direction
    routes.push([
      new THREE.Vector3(400, 0.4, z + 5),
      new THREE.Vector3(200, 0.4, z + 5),
      new THREE.Vector3(0, 0.4, z + 5),
      new THREE.Vector3(-200, 0.4, z + 5),
      new THREE.Vector3(-400, 0.4, z + 5),
    ]);
  }

  // Vertical routes
  for (let col = -2; col <= 2; col++) {
    const x = col * ROAD_SPACING;
    routes.push([
      new THREE.Vector3(x, 0.4, -400),
      new THREE.Vector3(x, 0.4, -200),
      new THREE.Vector3(x, 0.4, 0),
      new THREE.Vector3(x, 0.4, 200),
      new THREE.Vector3(x, 0.4, 400),
    ]);
    routes.push([
      new THREE.Vector3(x + 5, 0.4, 400),
      new THREE.Vector3(x + 5, 0.4, 200),
      new THREE.Vector3(x + 5, 0.4, 0),
      new THREE.Vector3(x + 5, 0.4, -200),
      new THREE.Vector3(x + 5, 0.4, -400),
    ]);
  }

  return routes;
}

function seeded(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export function TrafficCars() {
  const routes = useMemo(() => generateWaypoints(), []);

  // 14 traffic cars
  const cars = useMemo<TrafficCar[]>(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      waypointIndex: Math.floor(seeded(i * 3) * 3),
      progress: seeded(i * 7),
      speed: 0.3 + seeded(i * 11) * 0.5,
      colorIndex: Math.floor(seeded(i * 13) * TRAFFIC_COLORS.length),
      lane: i % routes.length,
    }));
  }, [routes.length]);

  const meshRefs = useRef<(THREE.Group | null)[]>([]);

  // State for positions/rotations (using refs for performance)
  const stateRef = useRef(
    cars.map((c) => ({
      routeIndex: c.lane % routes.length,
      waypointIndex: c.waypointIndex,
      progress: c.progress,
    })),
  );

  useFrame((_, delta) => {
    cars.forEach((car, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      const state = stateRef.current[i];
      const route = routes[state.routeIndex];
      if (!route || route.length < 2) return;

      // Advance progress
      state.progress += car.speed * delta;
      if (state.progress >= 1) {
        state.progress = 0;
        state.waypointIndex = (state.waypointIndex + 1) % (route.length - 1);
      }

      // Interpolate position
      const wpA = route[state.waypointIndex];
      const wpB = route[(state.waypointIndex + 1) % route.length];
      if (!wpA || !wpB) return;

      const pos = wpA.clone().lerp(wpB, state.progress);
      mesh.position.copy(pos);

      // Face direction
      const dir = wpB.clone().sub(wpA).normalize();
      if (dir.length() > 0.01) {
        const angle = Math.atan2(dir.x, dir.z);
        mesh.rotation.y = angle;
      }
    });
  });

  return (
    <group>
      {cars.map((car, i) => (
        <group
          key={car.id}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
        >
          <TrafficCarMesh color={TRAFFIC_COLORS[car.colorIndex]} />
        </group>
      ))}
    </group>
  );
}

function TrafficCarMesh({ color }: { color: string }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.6, 0.5, 3.8]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.72, -0.1]} castShadow>
        <boxGeometry args={[1.4, 0.32, 2.0]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Headlights */}
      <mesh position={[0, 0.3, 1.95]}>
        <boxGeometry args={[1.2, 0.15, 0.05]} />
        <meshStandardMaterial
          emissive="#DDDDFF"
          emissiveIntensity={1.5}
          color="#FFFFFF"
        />
      </mesh>
      {/* Taillights */}
      <mesh position={[0, 0.3, -1.95]}>
        <boxGeometry args={[1.2, 0.12, 0.05]} />
        <meshStandardMaterial
          emissive="#FF2200"
          emissiveIntensity={2}
          color="#FF0000"
        />
      </mesh>
      {/* Wheels */}
      {(
        [
          [-0.85, 0.05, 1.1],
          [0.85, 0.05, 1.1],
          [-0.85, 0.05, -1.1],
          [0.85, 0.05, -1.1],
        ] as [number, number, number][]
      ).map((pos, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static wheel positions
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.28, 0.2, 8]} />
          <meshStandardMaterial color="#111111" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
