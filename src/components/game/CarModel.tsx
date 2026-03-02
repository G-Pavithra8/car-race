import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CarState } from "@/hooks/useRaceGame";

interface CarModelProps {
  car: CarState;
}

export function CarModel({ car }: CarModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelFLRef = useRef<THREE.Mesh>(null);
  const wheelFRRef = useRef<THREE.Mesh>(null);
  const wheelRLRef = useRef<THREE.Mesh>(null);
  const wheelRRRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!groupRef.current || car.inRace === false) return;

    groupRef.current.position.set(car.x, 0.4, car.z);

    const targetX = car.targetLane * 3;
    const dx = targetX - car.x;
    groupRef.current.rotation.z = -dx * 0.03;

    const wheelSpeed = car.speed * delta * 1.8;
    [wheelFLRef, wheelFRRef, wheelRLRef, wheelRRRef].forEach((ref) => {
      if (ref.current) ref.current.rotation.x += wheelSpeed;
    });
  });

  if (car.inRace === false) return null;

  const isPlayer = car.isPlayer;
  const bodyWidth = isPlayer ? 2.2 : 1.9;
  const bodyLength = isPlayer ? 4.5 : 3.8;

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[bodyWidth, 0.6, bodyLength]} />
        <meshStandardMaterial color={car.color} roughness={0.3} metalness={0.7} />
      </mesh>

      <mesh position={[0, 0.75, -0.3]}>
        <boxGeometry args={[bodyWidth * 0.75, 0.5, bodyLength * 0.45]} />
        <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.9} opacity={0.8} transparent />
      </mesh>

      {isPlayer && (
        <mesh position={[0, 0.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.4, bodyLength * 0.9]} />
          <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
        </mesh>
      )}

      {isPlayer && (
        <group position={[0, 0.8, -bodyLength / 2 + 0.3]}>
          <mesh>
            <boxGeometry args={[bodyWidth * 0.8, 0.08, 0.3]} />
            <meshStandardMaterial color={car.color} metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-bodyWidth * 0.35, -0.15, 0]}>
            <boxGeometry args={[0.08, 0.3, 0.15]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[bodyWidth * 0.35, -0.15, 0]}>
            <boxGeometry args={[0.08, 0.3, 0.15]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      )}

      {isPlayer && (
        <pointLight position={[0, -0.1, 0]} color="#dc2626" intensity={2} distance={4} />
      )}

      <mesh position={[-bodyWidth / 2 + 0.3, 0.3, bodyLength / 2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffffcc" />
      </mesh>
      <mesh position={[bodyWidth / 2 - 0.3, 0.3, bodyLength / 2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffffcc" />
      </mesh>

      <mesh position={[-bodyWidth / 2 + 0.3, 0.3, -bodyLength / 2]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={car.isBraking ? "#ff0000" : "#660000"} />
      </mesh>
      <mesh position={[bodyWidth / 2 - 0.3, 0.3, -bodyLength / 2]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={car.isBraking ? "#ff0000" : "#660000"} />
      </mesh>
      {car.isBraking && (
        <pointLight position={[0, 0.3, -bodyLength / 2]} color="#ff0000" intensity={3} distance={5} />
      )}

      {isPlayer && car.speed > 54 && (
        <mesh position={[0, 0.2, -bodyLength / 2 - 0.5]} scale={[0.3, 0.3, 0.5 + car.speed * 0.01]}>
          <coneGeometry args={[0.5, 1.5, 6]} />
          <meshBasicMaterial color="#ff6600" opacity={0.7} transparent />
        </mesh>
      )}

      <mesh ref={wheelFLRef} position={[-bodyWidth / 2 + 0.2, -0.15, bodyLength / 2 - 0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh ref={wheelFRRef} position={[bodyWidth / 2 - 0.2, -0.15, bodyLength / 2 - 0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh ref={wheelRLRef} position={[-bodyWidth / 2 + 0.2, -0.15, -bodyLength / 2 + 0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh ref={wheelRRRef} position={[bodyWidth / 2 - 0.2, -0.15, -bodyLength / 2 + 0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
    </group>
  );
}
