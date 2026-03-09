import { useMemo, useRef } from "react";
import * as THREE from "three";

// City block layout
const BLOCK_SIZE = 60;
const ROAD_WIDTH = 18;
const GRID_COUNT = 7; // 7x7 grid of blocks
const WORLD_SIZE = 1000;

// Deterministic pseudo-random based on seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface BuildingData {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  colorIndex: number;
}

interface TreeData {
  x: number;
  z: number;
}

function generateCity() {
  const buildings: BuildingData[] = [];
  const trees: TreeData[] = [];

  for (let gx = -GRID_COUNT; gx <= GRID_COUNT; gx++) {
    for (let gz = -GRID_COUNT; gz <= GRID_COUNT; gz++) {
      const blockCenterX = gx * (BLOCK_SIZE + ROAD_WIDTH);
      const blockCenterZ = gz * (BLOCK_SIZE + ROAD_WIDTH);

      // Skip center area (player start zone)
      if (Math.abs(blockCenterX) < 80 && Math.abs(blockCenterZ) < 80) continue;

      // Fill block with buildings
      const seed = (gx + 100) * 200 + (gz + 100);
      const buildingCount = Math.floor(seededRandom(seed) * 3) + 1;

      for (let b = 0; b < buildingCount; b++) {
        const bSeed = seed * 10 + b;
        const w = 10 + seededRandom(bSeed) * 25;
        const d = 10 + seededRandom(bSeed + 1) * 25;
        const h = 8 + seededRandom(bSeed + 2) * 55;
        const offsetX = (seededRandom(bSeed + 3) - 0.5) * (BLOCK_SIZE - w);
        const offsetZ = (seededRandom(bSeed + 4) - 0.5) * (BLOCK_SIZE - d);

        buildings.push({
          x: blockCenterX + offsetX,
          z: blockCenterZ + offsetZ,
          width: w,
          depth: d,
          height: h,
          colorIndex: Math.floor(seededRandom(bSeed + 5) * 6),
        });
      }

      // Trees on outskirts of blocks
      if (seededRandom(seed + 50) > 0.6) {
        trees.push({
          x:
            blockCenterX +
            (BLOCK_SIZE / 2 + 4) * (seededRandom(seed + 51) > 0.5 ? 1 : -1),
          z: blockCenterZ + (seededRandom(seed + 52) - 0.5) * BLOCK_SIZE,
        });
      }
    }
  }

  return { buildings, trees };
}

const BUILDING_COLORS = [
  "#2a3545",
  "#1e2d3e",
  "#3a3a4a",
  "#2d2d3d",
  "#1a2535",
  "#353545",
];

const BUILDING_WINDOW_COLORS = [
  "#4488FF",
  "#FFCC44",
  "#FF4444",
  "#44FFCC",
  "#FF8844",
  "#AAAAFF",
];

export function CityWorld() {
  const { buildings, trees } = useMemo(() => generateCity(), []);

  return (
    <group>
      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[WORLD_SIZE, WORLD_SIZE]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Road grid - horizontal strips */}
      {Array.from({ length: GRID_COUNT * 2 + 2 }, (_, i) => {
        const idx = i - GRID_COUNT - 1;
        const z = idx * (BLOCK_SIZE + ROAD_WIDTH);
        const stableKey = `road-h-pos-${idx}`;
        return (
          <mesh
            key={stableKey}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.001, z]}
            receiveShadow
          >
            <planeGeometry args={[WORLD_SIZE, ROAD_WIDTH]} />
            <meshStandardMaterial
              color="#2a2a2a"
              roughness={0.8}
              metalness={0.05}
            />
          </mesh>
        );
      })}

      {/* Road grid - vertical strips */}
      {Array.from({ length: GRID_COUNT * 2 + 2 }, (_, i) => {
        const idx = i - GRID_COUNT - 1;
        const x = idx * (BLOCK_SIZE + ROAD_WIDTH);
        const stableKey = `road-v-pos-${idx}`;
        return (
          <mesh
            key={stableKey}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[x, 0.001, 0]}
            receiveShadow
          >
            <planeGeometry args={[ROAD_WIDTH, WORLD_SIZE]} />
            <meshStandardMaterial
              color="#2a2a2a"
              roughness={0.8}
              metalness={0.05}
            />
          </mesh>
        );
      })}

      {/* Road markings - center lines */}
      {Array.from({ length: GRID_COUNT * 2 + 2 }, (_, i) => {
        const idx = i - GRID_COUNT - 1;
        const z = idx * (BLOCK_SIZE + ROAD_WIDTH);
        const stableKey = `line-h-pos-${idx}`;
        return (
          <mesh
            key={stableKey}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.002, z]}
            receiveShadow
          >
            <planeGeometry args={[WORLD_SIZE, 0.4]} />
            <meshStandardMaterial color="#555555" roughness={0.9} />
          </mesh>
        );
      })}

      {/* Buildings */}
      {buildings.map((b, i) => (
        <BuildingMesh
          key={`bld-${Math.round(b.x)}-${Math.round(b.z)}`}
          building={b}
          index={i}
        />
      ))}

      {/* Trees */}
      {trees.map((t, i) => (
        <TreeMesh
          key={`tree-${Math.round(t.x)}-${Math.round(t.z)}`}
          x={t.x}
          z={t.z}
          seed={i}
        />
      ))}

      {/* Traffic lights at intersections */}
      {Array.from({ length: 5 }, (_, gx) =>
        Array.from({ length: 5 }, (_, gz) => {
          const row = gx - 2;
          const col = gz - 2;
          const x = row * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH / 2 + 2;
          const z = col * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH / 2 + 2;
          return (
            <TrafficLight
              key={`tl-r${row}-c${col}`}
              x={x}
              z={z}
              offset={gx * 5 + gz}
            />
          );
        }),
      )}

      {/* Distant fog plane */}
      <fog attach="fog" args={["#0a0a12", 80, 350]} />
    </group>
  );
}

function BuildingMesh({
  building,
  index,
}: { building: BuildingData; index: number }) {
  const color = BUILDING_COLORS[building.colorIndex];
  const windowColor = BUILDING_WINDOW_COLORS[building.colorIndex];

  return (
    <group position={[building.x, 0, building.z]}>
      {/* Main structure */}
      <mesh position={[0, building.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[building.width, building.height, building.depth]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Window glow texture - just emission planes */}
      <mesh position={[0, building.height * 0.5, building.depth / 2 + 0.1]}>
        <planeGeometry args={[building.width * 0.8, building.height * 0.8]} />
        <meshStandardMaterial
          color={windowColor}
          emissive={windowColor}
          emissiveIntensity={0.08 + seededRandom(index) * 0.12}
          transparent
          opacity={0.3 + seededRandom(index + 1) * 0.2}
        />
      </mesh>

      {/* Rooftop light */}
      {building.height > 30 && (
        <pointLight
          position={[0, building.height + 0.5, 0]}
          color={windowColor}
          intensity={0.4}
          distance={15}
        />
      )}
    </group>
  );
}

function TreeMesh({ x, z, seed }: { x: number; z: number; seed: number }) {
  const scale = 0.8 + seededRandom(seed) * 0.6;
  return (
    <group position={[x, 0, z]} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 3, 6]} />
        <meshStandardMaterial color="#3d2508" roughness={0.9} />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <coneGeometry args={[2, 5, 6]} />
        <meshStandardMaterial color="#1a4a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 6.5, 0]} castShadow>
        <coneGeometry args={[1.5, 4, 6]} />
        <meshStandardMaterial color="#1e5a1e" roughness={0.8} />
      </mesh>
    </group>
  );
}

function TrafficLight({
  x,
  z,
  offset,
}: { x: number; z: number; offset: number }) {
  const phase = (Date.now() / 3000 + offset * 0.7) % 3;
  const isGreen = phase < 1.5;
  const isYellow = phase >= 1.5 && phase < 2.0;
  const isRed = phase >= 2.0;

  return (
    <group position={[x, 0, z]}>
      {/* Pole */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 6, 6]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Housing */}
      <mesh position={[0, 6.2, 0]}>
        <boxGeometry args={[0.4, 1.2, 0.4]} />
        <meshStandardMaterial color="#222222" metalness={0.6} />
      </mesh>
      {/* Lights */}
      <mesh position={[0, 6.6, 0.22]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial
          color={isRed ? "#FF2200" : "#331100"}
          emissive={isRed ? "#FF2200" : "#000000"}
          emissiveIntensity={isRed ? 3 : 0}
        />
      </mesh>
      <mesh position={[0, 6.2, 0.22]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial
          color={isYellow ? "#FFAA00" : "#332200"}
          emissive={isYellow ? "#FFAA00" : "#000000"}
          emissiveIntensity={isYellow ? 3 : 0}
        />
      </mesh>
      <mesh position={[0, 5.8, 0.22]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial
          color={isGreen ? "#00FF44" : "#003311"}
          emissive={isGreen ? "#00FF44" : "#000000"}
          emissiveIntensity={isGreen ? 3 : 0}
        />
      </mesh>
    </group>
  );
}
