import type { CarState } from "@/hooks/useRaceGame";

interface HUDProps {
  speed: number;
  position: number;
  totalCars: number;
  distanceRemaining: number;
  trackLength: number;
  sortedCars: CarState[];
}

export function HUD({ speed, position, totalCars, distanceRemaining, trackLength, sortedCars }: HUDProps) {
  const speedKmh = Math.round(speed * 3.6);
  const progressPercent = Math.min(100, ((trackLength - distanceRemaining) / trackLength) * 100);

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2">
        <div className="font-display text-[10px] tracking-widest text-muted-foreground mb-0.5">POSITION</div>
        <div className="font-display text-3xl font-bold text-foreground leading-none">
          <span className="text-primary">{position}</span>
          <span className="text-muted-foreground text-base">/{totalCars}</span>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-5 py-2 text-center">
        <div className="font-display text-[10px] tracking-widest text-muted-foreground mb-0.5">DISTANCE</div>
        <div className="font-display text-lg font-bold text-foreground leading-none">
          {Math.max(0, Math.round(distanceRemaining))}m
        </div>
        <div className="w-36 h-1 bg-secondary rounded-full mt-1.5 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-150" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2 min-w-[140px]">
        <div className="font-display text-[10px] tracking-widest text-muted-foreground mb-1">LEADERBOARD</div>
        <div className="space-y-0.5">
          {sortedCars.slice(0, 5).map((car, i) => (
            <div
              key={car.id}
              className={`flex items-center gap-2 text-xs font-body ${car.isPlayer ? "text-primary font-bold" : "text-muted-foreground"}`}
            >
              <span className="font-display text-[10px] w-4">{i + 1}.</span>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: car.color }} />
              <span className="truncate">{car.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 w-32 h-32">
        <div className="relative w-full h-full bg-card/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center">
          <div className="text-center">
            <div className="font-display text-xl font-bold text-foreground leading-none">{speedKmh}</div>
            <div className="font-display text-[9px] tracking-widest text-muted-foreground">KM/H</div>
          </div>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="3"
              strokeDasharray="207"
              strokeDashoffset="69"
              transform="rotate(135, 50, 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray="207"
              strokeDashoffset={207 - (Math.min(speedKmh, 360) / 360) * 207 * 0.75}
              transform="rotate(135, 50, 50)"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
