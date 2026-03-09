import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";

const MAP_SIZE = 120;
const WORLD_TO_MAP = MAP_SIZE / 1000; // 1000 world units -> 120px

// Pre-draw road grid for the minimap
const ROAD_SPACING = 78;
const GRID_COUNT = 7;

export function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Track car position from store
  const posRef = useRef({ x: 0, z: 0, rot: 0 });

  // We need the actual car position - we'll use a shared ref approach
  // For now use a simple polling from the store distance
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);

      // Background
      ctx.fillStyle = "rgba(5,5,15,0.92)";
      ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

      // Border
      ctx.strokeStyle = "oklch(0.85 0.18 195)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, MAP_SIZE - 1, MAP_SIZE - 1);

      // Road grid
      ctx.fillStyle = "#333344";
      const roadWidthPx = 18 * WORLD_TO_MAP;

      for (let i = -GRID_COUNT; i <= GRID_COUNT + 1; i++) {
        const wx = i * ROAD_SPACING;
        const px = (wx + 500) * WORLD_TO_MAP;
        ctx.fillRect(px - roadWidthPx / 2, 0, roadWidthPx, MAP_SIZE);
      }
      for (let i = -GRID_COUNT; i <= GRID_COUNT + 1; i++) {
        const wz = i * ROAD_SPACING;
        const pz = (wz + 500) * WORLD_TO_MAP;
        ctx.fillRect(0, pz - roadWidthPx / 2, MAP_SIZE, roadWidthPx);
      }

      // Player dot
      const px = (posRef.current.x + 500) * WORLD_TO_MAP;
      const pz = (posRef.current.z + 500) * WORLD_TO_MAP;

      // Car indicator (triangle pointing in direction)
      ctx.save();
      ctx.translate(px, pz);
      ctx.rotate(posRef.current.rot);
      ctx.fillStyle = "#00DDFF";
      ctx.shadowColor = "#00DDFF";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(3, 4);
      ctx.lineTo(-3, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      className="minimap-container"
      style={{ width: MAP_SIZE, height: MAP_SIZE }}
    >
      <canvas
        ref={canvasRef}
        width={MAP_SIZE}
        height={MAP_SIZE}
        style={{ display: "block" }}
      />
    </div>
  );
}

// Export a way to update car pos from game
export const minimapCarPos = { x: 0, z: 0, rot: 0 };
