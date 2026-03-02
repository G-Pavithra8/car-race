import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Track } from "./Track";
import { CarModel } from "./CarModel";
import type { CarState } from "@/hooks/useRaceGame";

interface CameraFollowProps {
  playerX: number;
  playerZ: number;
}

const targetPosition = new THREE.Vector3();
const lookAtTarget = new THREE.Vector3();

function CameraFollow({ playerX, playerZ }: CameraFollowProps) {
  const hasStartedRef = useRef(false);

  useFrame(({ camera }, delta) => {
    const followDistance = 16;
    targetPosition.set(playerX * 0.35, 8, playerZ - followDistance);

    if (!hasStartedRef.current) {
      camera.position.copy(targetPosition);
      hasStartedRef.current = true;
    } else {
      camera.position.lerp(targetPosition, 1 - Math.exp(-3.2 * delta));
    }

    lookAtTarget.set(playerX * 0.4, 1.5, playerZ + 28);
    camera.lookAt(lookAtTarget);
  });

  return null;
}

interface GameSceneProps {
  cars: CarState[];
  playerX: number;
  playerZ: number;
  trackLength: number;
}

export function GameScene({ cars, playerX, playerZ, trackLength }: GameSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 8, -14], fov: 65, near: 0.1, far: 1000 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["#0a0a1a"]} />
      <fog attach="fog" args={["#0a0a1a", 90, 340]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 25, 12]} intensity={0.9} color="#ffffff" />
      <directionalLight position={[-8, 12, -10]} intensity={0.25} color="#4488ff" />

      <CameraFollow playerX={playerX} playerZ={playerZ} />
      <Track trackLength={trackLength} />

      {cars.map((car) => (
        <CarModel key={car.id} car={car} />
      ))}
    </Canvas>
  );
}
