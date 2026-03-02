import { useCallback, useEffect, useRef, useState } from "react";

export interface CarState {
  id: string;
  name: string;
  x: number;
  z: number;
  speed: number;
  maxSpeed: number;
  targetLane: number;
  color: string;
  isPlayer?: boolean;
  isBraking?: boolean;
  finished?: boolean;
  finishTime?: number;
  accelRate: number;
  inRace?: boolean;
  laneDecisionCooldown?: number;
}

const TRACK_LENGTH = 3000;
const STARTING_AI_COUNT = 8;
const MAX_AI = 10;
const LANE_WIDTH = 3;
const LANES = [-2, -1, 0, 1, 2] as const;
const AI_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#eab308",
  "#14b8a6",
];
const AI_NAMES = [
  "Rossi",
  "Vettel",
  "Hamilton",
  "Leclerc",
  "Alonso",
  "Norris",
  "Sainz",
  "Piastri",
  "Verstappen",
  "Russell",
];

const MAX_PLAYER_SPEED = 92;
const PLAYER_ACCEL = 28;
const BRAKE_FORCE = 42;
const FRICTION = 10;
const LANE_SWITCH_COOLDOWN = 0.11;
const LANE_SWITCH_RESPONSIVENESS = 8;
const SPAWN_BASE_COOLDOWN = 8;

export type GamePhase = "countdown" | "racing" | "finished";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function useRaceGame() {
  const [phase, setPhase] = useState<GamePhase>("countdown");
  const [countdown, setCountdown] = useState(3);
  const [playerPosition, setPlayerPosition] = useState(1);
  const [sortedCars, setSortedCars] = useState<CarState[]>([]);

  const keysRef = useRef<Set<string>>(new Set());
  const carsRef = useRef<CarState[]>([]);
  const playerFinishedRef = useRef(false);
  const raceTimeRef = useRef(0);
  const laneSwitchCooldownRef = useRef(0);
  const nextAIIdRef = useRef(STARTING_AI_COUNT);
  const spawnCooldownRef = useRef(SPAWN_BASE_COOLDOWN);

  const createAI = useCallback((index: number, lane: number, z: number): CarState => {
    const speedBias = (index % 5) * 2.2;
    return {
      id: `ai-${index}`,
      name: AI_NAMES[index] ?? `Rival ${index + 1}`,
      x: lane * LANE_WIDTH,
      z,
      speed: 0,
      maxSpeed: 70 + speedBias,
      targetLane: lane,
      color: AI_COLORS[index % AI_COLORS.length],
      accelRate: 16 + (index % 4) * 1.8,
      inRace: true,
      laneDecisionCooldown: 0.3 + Math.random() * 0.8,
    };
  }, []);

  const initCars = useCallback(() => {
    const gridLanes = [0, -1, 1, -2, 2];

    const cars: CarState[] = [
      {
        id: "player",
        name: "YOU",
        x: 0,
        z: 0,
        speed: 0,
        maxSpeed: MAX_PLAYER_SPEED,
        targetLane: 0,
        color: "#dc2626",
        isPlayer: true,
        isBraking: false,
        accelRate: PLAYER_ACCEL,
        inRace: true,
      },
    ];

    for (let i = 0; i < STARTING_AI_COUNT; i++) {
      const row = Math.floor(i / gridLanes.length);
      const lane = gridLanes[i % gridLanes.length];
      const z = -10 - row * 12;
      cars.push(createAI(i, lane, z));
    }

    carsRef.current = cars;
    playerFinishedRef.current = false;
    raceTimeRef.current = 0;
    laneSwitchCooldownRef.current = 0;
    nextAIIdRef.current = STARTING_AI_COUNT;
    spawnCooldownRef.current = SPAWN_BASE_COOLDOWN;
    setPlayerPosition(1);
    setSortedCars([...cars].sort((a, b) => b.z - a.z));
  }, [createAI]);

  useEffect(() => {
    initCars();
  }, [initCars]);

  useEffect(() => {
    if (phase !== "countdown") return;

    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setPhase("racing");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current.add(e.key);
    };

    const onUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const spawnDynamicAI = useCallback((playerZ: number) => {
    const cars = carsRef.current;
    const currentAICount = cars.filter((c) => !c.isPlayer && c.inRace !== false).length;
    if (currentAICount >= MAX_AI) return;

    const spawnCount = Math.random() < 0.28 && currentAICount < MAX_AI - 1 ? 2 : 1;

    for (let i = 0; i < spawnCount; i++) {
      const aiIndex = nextAIIdRef.current;
      const occupiedSpawnLanes = new Set(
        cars
          .filter((c) => c.inRace !== false && Math.abs(c.z - (playerZ - 140)) < 25)
          .map((c) => c.targetLane)
      );

      const candidateLanes = [...LANES].filter((lane) => !occupiedSpawnLanes.has(lane));
      const lane = (candidateLanes[0] ?? LANES[Math.floor(Math.random() * LANES.length)]) as number;
      const z = playerZ - 150 - i * 15 - Math.random() * 30;

      cars.push(createAI(aiIndex, lane, z));
      nextAIIdRef.current += 1;
    }
  }, [createAI]);

  const update = useCallback((deltaTime: number) => {
    const dt = clamp(deltaTime || 0.016, 0.001, 0.05);
    const cars = carsRef.current;

    if (cars.length === 0) return cars;
    if (phase !== "racing") return cars;

    raceTimeRef.current += dt;

    const keys = keysRef.current;
    const player = cars[0];

    laneSwitchCooldownRef.current = Math.max(0, laneSwitchCooldownRef.current - dt);

    if (keys.has("ArrowUp")) {
      player.speed = Math.min(player.speed + player.accelRate * dt, player.maxSpeed);
    } else if (keys.has("ArrowDown")) {
      player.speed = Math.max(player.speed - BRAKE_FORCE * dt, 0);
      player.isBraking = true;
    } else {
      player.speed = Math.max(player.speed - FRICTION * dt, 0);
      player.isBraking = false;
    }

    if (!keys.has("ArrowDown")) player.isBraking = false;

    if (keys.has("ArrowLeft") && laneSwitchCooldownRef.current === 0) {
      player.targetLane = Math.max(player.targetLane - 1, -2);
      laneSwitchCooldownRef.current = LANE_SWITCH_COOLDOWN;
    }
    if (keys.has("ArrowRight") && laneSwitchCooldownRef.current === 0) {
      player.targetLane = Math.min(player.targetLane + 1, 2);
      laneSwitchCooldownRef.current = LANE_SWITCH_COOLDOWN;
    }

    const activeCars = cars.filter((c) => c.inRace !== false && !c.finished);

    for (let i = 1; i < cars.length; i++) {
      const car = cars[i];
      if (car.inRace === false || car.finished) continue;

      car.laneDecisionCooldown = Math.max(0, (car.laneDecisionCooldown ?? 0) - dt);

      const paceVariance = 0.88 + Math.sin((raceTimeRef.current + i) * 0.4) * 0.07;
      const desiredSpeed = car.maxSpeed * paceVariance;
      if (car.speed < desiredSpeed) {
        car.speed = Math.min(car.speed + car.accelRate * dt, car.maxSpeed);
      } else {
        car.speed = Math.max(desiredSpeed, car.speed - FRICTION * 0.45 * dt);
      }

      car.speed += (Math.random() - 0.5) * 1.2 * dt;
      car.speed = clamp(car.speed, 18, car.maxSpeed);

      const carAhead = activeCars.find(
        (other) =>
          other.id !== car.id &&
          other.targetLane === car.targetLane &&
          other.z > car.z &&
          other.z - car.z < 18
      );

      if (carAhead) {
        car.speed = Math.min(car.speed, carAhead.speed * 0.98);

        if ((car.laneDecisionCooldown ?? 0) === 0) {
          const laneOptions = [...LANES].filter((lane) => {
            if (lane === car.targetLane) return false;
            return !activeCars.some(
              (other) =>
                other.id !== car.id &&
                Math.abs(other.z - car.z) < 14 &&
                other.targetLane === lane
            );
          });

          if (laneOptions.length > 0) {
            laneOptions.sort((a, b) => Math.abs(a - player.targetLane) - Math.abs(b - player.targetLane));
            car.targetLane = laneOptions[laneOptions.length - 1];
          }
          car.laneDecisionCooldown = 0.45 + Math.random() * 0.55;
        }
      } else if ((car.laneDecisionCooldown ?? 0) === 0 && Math.random() < 0.06 * dt * 60) {
        const randomShift = Math.random() > 0.5 ? 1 : -1;
        const nextLane = clamp(car.targetLane + randomShift, -2, 2);
        const blocked = activeCars.some(
          (other) =>
            other.id !== car.id &&
            Math.abs(other.z - car.z) < 11 &&
            other.targetLane === nextLane
        );
        if (!blocked) car.targetLane = nextLane;
        car.laneDecisionCooldown = 0.35 + Math.random() * 0.65;
      }
    }

    const nearbyAI = cars.filter(
      (c) => !c.isPlayer && c.inRace !== false && !c.finished && Math.abs(c.z - player.z) < 20
    );
    const blockedLanes = new Set(nearbyAI.map((c) => c.targetLane));
    const freeLanes = LANES.filter((lane) => !blockedLanes.has(lane));

    if (freeLanes.length < 2 && nearbyAI.length > 0) {
      const crowders = [...nearbyAI].sort((a, b) => Math.abs(a.z - player.z) - Math.abs(b.z - player.z));
      for (const crowder of crowders) {
        const laneCandidates = [...LANES]
          .filter((lane) => lane !== crowder.targetLane)
          .filter(
            (lane) =>
              !cars.some(
                (other) =>
                  other.id !== crowder.id &&
                  other.inRace !== false &&
                  Math.abs(other.z - crowder.z) < 12 &&
                  other.targetLane === lane
              )
          )
          .sort((a, b) => Math.abs(a - player.targetLane) - Math.abs(b - player.targetLane));

        const bestLane = laneCandidates[laneCandidates.length - 1];
        if (bestLane !== undefined) {
          crowder.targetLane = bestLane;
        }

        const updatedBlocked = new Set(
          cars
            .filter((c) => !c.isPlayer && c.inRace !== false && !c.finished && Math.abs(c.z - player.z) < 20)
            .map((c) => c.targetLane)
        );
        if (LANES.filter((lane) => !updatedBlocked.has(lane)).length >= 2) break;
      }
    }

    for (const car of cars) {
      if (car.inRace === false) continue;

      const targetX = car.targetLane * LANE_WIDTH;
      car.x += (targetX - car.x) * Math.min(1, dt * LANE_SWITCH_RESPONSIVENESS);
      car.z += car.speed * dt;

      if (car.z >= TRACK_LENGTH && !car.finished) {
        car.finished = true;
        car.finishTime = raceTimeRef.current;
        car.speed = 0;
      }
    }

    for (let i = 1; i < cars.length; i++) {
      const car = cars[i];
      if (car.inRace === false || car.finished) continue;

      if (car.z < player.z - 260 && car.speed < car.maxSpeed * 0.5) {
        car.inRace = false;
        car.speed = 0;
      }
    }

    const activeAICount = cars.filter((c) => !c.isPlayer && c.inRace !== false).length;
    spawnCooldownRef.current -= dt;
    if (player.speed > 58 && activeAICount < MAX_AI && spawnCooldownRef.current <= 0) {
      spawnDynamicAI(player.z);
      spawnCooldownRef.current = SPAWN_BASE_COOLDOWN + Math.random() * 4;
    }

    const rankingCars = cars.filter((c) => c.inRace !== false);
    const sorted = [...rankingCars].sort((a, b) => {
      if (a.finished && b.finished) {
        return (a.finishTime ?? Number.POSITIVE_INFINITY) - (b.finishTime ?? Number.POSITIVE_INFINITY);
      }
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.z - a.z;
    });

    const playerIdx = sorted.findIndex((c) => c.id === "player");
    setPlayerPosition(playerIdx >= 0 ? playerIdx + 1 : sorted.length);
    setSortedCars(sorted);

    if (player.finished && !playerFinishedRef.current) {
      playerFinishedRef.current = true;
      setTimeout(() => setPhase("finished"), 1200);
    }

    return cars;
  }, [phase, spawnDynamicAI]);

  const restart = useCallback(() => {
    setPhase("countdown");
    setCountdown(3);
    initCars();
  }, [initCars]);

  return {
    phase,
    countdown,
    playerPosition,
    totalCars: carsRef.current.filter((c) => c.inRace !== false).length,
    trackLength: TRACK_LENGTH,
    sortedCars,
    update,
    restart,
    getCars: () => carsRef.current.filter((c) => c.inRace !== false),
    getPlayerSpeed: () => carsRef.current[0]?.speed ?? 0,
    getPlayerX: () => carsRef.current[0]?.x ?? 0,
    getPlayerZ: () => carsRef.current[0]?.z ?? 0,
  };
}
