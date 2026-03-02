import { useMemo } from "react";

const TRACK_WIDTH = 30;
const LANE_COUNT = 5;
const LANE_WIDTH = 3;

interface TrackProps {
  trackLength: number;
}

export function Track({ trackLength }: TrackProps) {
  const dashLines = useMemo(() => {
    const lines: JSX.Element[] = [];

    for (let z = 0; z < trackLength; z += 12) {
      for (let lane = -2; lane <= 1; lane++) {
        lines.push(
          <mesh key={`dash-${z}-${lane}`} position={[lane * LANE_WIDTH + LANE_WIDTH / 2, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.15, 4]} />
            <meshBasicMaterial color="#ffffff" opacity={0.35} transparent />
          </mesh>
        );
      }
    }

    const edgeLeft = (-LANE_COUNT * LANE_WIDTH) / 2 - 0.5;
    const edgeRight = (LANE_COUNT * LANE_WIDTH) / 2 + 0.5;

    for (let z = 0; z < trackLength; z += 22) {
      lines.push(
        <mesh key={`edge-l-${z}`} position={[edgeLeft, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 22]} />
          <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
        </mesh>
      );
      lines.push(
        <mesh key={`edge-r-${z}`} position={[edgeRight, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 22]} />
          <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
        </mesh>
      );
    }

    return lines;
  }, [trackLength]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, trackLength / 2]}>
        <planeGeometry args={[TRACK_WIDTH, trackLength + 200]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.82} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, -0.01, trackLength / 2]}>
        <planeGeometry args={[20, trackLength + 200]} />
        <meshStandardMaterial color="#0d1f0d" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[25, -0.01, trackLength / 2]}>
        <planeGeometry args={[20, trackLength + 200]} />
        <meshStandardMaterial color="#0d1f0d" roughness={1} />
      </mesh>

      {dashLines}

      <group position={[0, 0, trackLength]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <planeGeometry args={[TRACK_WIDTH, 3]} />
          <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
        </mesh>
        <mesh position={[-TRACK_WIDTH / 2, 5, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 10]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <mesh position={[TRACK_WIDTH / 2, 5, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 10]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <mesh position={[0, 9, 0]}>
          <boxGeometry args={[TRACK_WIDTH, 2, 0.2]} />
          <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
}
