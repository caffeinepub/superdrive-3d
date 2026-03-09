import { useCallback, useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import { audioManager } from "../utils/audioManager";

interface TouchButtonProps {
  label: string;
  keyName: string;
  style?: React.CSSProperties;
  className?: string;
  size?: "sm" | "md" | "lg";
}

function TouchButton({
  label,
  keyName,
  style,
  className,
  size = "md",
}: TouchButtonProps) {
  const { pressKey, releaseKey } = useGameStore();
  const isActive = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleStart = useCallback(
    (e: React.TouchEvent | React.PointerEvent) => {
      e.preventDefault();
      if (!isActive.current) {
        isActive.current = true;
        btnRef.current?.classList.add("active");
        pressKey(keyName);
        audioManager.resume();
      }
    },
    [pressKey, keyName],
  );

  const handleEnd = useCallback(
    (e: React.TouchEvent | React.PointerEvent) => {
      e.preventDefault();
      if (isActive.current) {
        isActive.current = false;
        btnRef.current?.classList.remove("active");
        releaseKey(keyName);
      }
    },
    [releaseKey, keyName],
  );

  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-sm",
    lg: "w-16 h-16 text-base",
  };

  return (
    <button
      type="button"
      ref={btnRef}
      className={`touch-btn font-bold select-none ${sizeClasses[size]} ${className ?? ""}`}
      style={style}
      onPointerDown={handleStart}
      onPointerUp={handleEnd}
      onPointerLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
    >
      {label}
    </button>
  );
}

export function TouchControls() {
  return (
    <div className="touch-controls">
      {/* Left D-pad: steering */}
      <div
        className="absolute bottom-6 left-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 4,
          width: 150,
        }}
      >
        {/* Empty top-left */}
        <div />
        {/* Up */}
        <TouchButton label="▲" keyName="ArrowUp" />
        {/* Empty top-right */}
        <div />
        {/* Left */}
        <TouchButton label="◄" keyName="ArrowLeft" />
        {/* Brake (center) */}
        <TouchButton label="■" keyName=" " size="sm" style={{ fontSize: 10 }} />
        {/* Right */}
        <TouchButton label="►" keyName="ArrowRight" />
        {/* Empty */}
        <div />
        {/* Down */}
        <TouchButton label="▼" keyName="ArrowDown" />
        {/* Empty */}
        <div />
      </div>

      {/* Right side: Nitro */}
      <div className="absolute bottom-6 right-4 flex flex-col gap-3 items-end">
        <TouchButton
          label="NITRO"
          keyName="Shift"
          size="lg"
          style={{
            background: "oklch(0.82 0.20 142 / 0.25)",
            borderColor: "oklch(0.82 0.20 142 / 0.6)",
            color: "oklch(0.82 0.20 142)",
            fontWeight: 900,
            letterSpacing: "0.05em",
          }}
        />
      </div>
    </div>
  );
}
