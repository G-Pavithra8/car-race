import { useEffect, useRef, useState } from "react";
import { useRaceGame } from "@/hooks/useRaceGame";
import { GameScene } from "./GameScene";
import { HUD } from "./HUD";
import { Countdown } from "./Countdown";
import { FinishScreen } from "./FinishScreen";
import type { CarState } from "@/hooks/useRaceGame";

export function RacingGame() {
  const {
    phase,
    countdown,
    playerPosition,
    totalCars,
    trackLength,
    sortedCars,
    update,
    restart,
    getPlayerSpeed,
    getPlayerX,
    getPlayerZ,
  } = useRaceGame();

  const [cars, setCars] = useState<CarState[]>([]);
  const [speed, setSpeed] = useState(0);
  const [playerX, setPlayerX] = useState(0);
  const [playerZ, setPlayerZ] = useState(0);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let running = true;

    const loop = (timestamp: number) => {
      if (!running) return;

      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }

      const dt = Math.min((timestamp - (lastFrameRef.current ?? timestamp)) / 1000, 0.05);
      lastFrameRef.current = timestamp;

      const updated = update(dt);
      setCars(updated.map((c) => ({ ...c })));
      setSpeed(getPlayerSpeed());
      setPlayerX(getPlayerX());
      setPlayerZ(getPlayerZ());

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      lastFrameRef.current = null;
      cancelAnimationFrame(rafRef.current);
    };
  }, [update, getPlayerSpeed, getPlayerX, getPlayerZ]);

  const distanceRemaining = trackLength - playerZ;
  const blurAmount = Math.min(Math.max(speed - 45, 0) * 0.02, 1.3);
  const winnerName = sortedCars[0]?.name ?? "Unknown";

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      <div
        className="w-full h-full"
        style={{
          filter: speed > 58 ? `blur(${blurAmount}px)` : "none",
          transition: "filter 0.2s linear",
        }}
      >
        <GameScene cars={cars} playerX={playerX} playerZ={playerZ} trackLength={trackLength} />
      </div>

      {phase === "countdown" && <Countdown count={countdown} />}

      {phase === "racing" && (
        <HUD
          speed={speed}
          position={playerPosition}
          totalCars={totalCars}
          distanceRemaining={distanceRemaining}
          trackLength={trackLength}
          sortedCars={sortedCars}
        />
      )}

      {phase === "finished" && (
        <FinishScreen
          position={playerPosition}
          totalCars={totalCars}
          winnerName={winnerName}
          sortedCars={sortedCars}
          onRestart={restart}
        />
      )}
    </div>
  );
}
