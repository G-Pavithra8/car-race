import type { CarState } from "@/hooks/useRaceGame";

interface FinishScreenProps {
  position: number;
  totalCars: number;
  winnerName: string;
  sortedCars: CarState[];
  onRestart: () => void;
}

export function FinishScreen({ position, totalCars, winnerName, sortedCars, onRestart }: FinishScreenProps) {
  const isWinner = position === 1;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-background/70 backdrop-blur-md">
      <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-lg w-full mx-4 box-glow">
        <div className="font-display text-xs tracking-[0.3em] text-muted-foreground mb-3">RACE COMPLETE</div>

        {isWinner ? (
          <>
            <div className="font-display text-5xl font-black text-primary text-glow mb-2">🏆 1ST PLACE</div>
            <p className="font-body text-lg text-muted-foreground mb-5">You dominated the race!</p>
          </>
        ) : (
          <>
            <div className="font-display text-5xl font-black text-foreground mb-2">P{position}</div>
            <p className="font-body text-lg text-muted-foreground mb-5">You finished {position}/{totalCars}</p>
          </>
        )}

        <p className="font-body text-sm text-muted-foreground mb-4">Winner: <span className="text-primary font-semibold">{winnerName}</span></p>

        <div className="mb-6 text-left bg-secondary/40 rounded-lg p-3 border border-border">
          <div className="font-display text-[10px] tracking-widest text-muted-foreground mb-2">FINAL LEADERBOARD</div>
          <div className="space-y-1.5">
            {sortedCars.slice(0, 5).map((car, i) => (
              <div key={car.id} className="flex justify-between items-center text-xs font-body">
                <span className={car.isPlayer ? "text-primary font-bold" : "text-foreground"}>{i + 1}. {car.name}</span>
                <span className="text-muted-foreground">{car.finished ? "Finished" : "DNF"}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onRestart}
          className="font-display text-sm tracking-widest bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:opacity-90 transition-opacity pointer-events-auto"
        >
          RACE AGAIN
        </button>
      </div>
    </div>
  );
}
