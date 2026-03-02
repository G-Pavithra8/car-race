interface CountdownProps {
  count: number;
}

export function Countdown({ count }: CountdownProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <div className="text-center">
        <div
          className="font-display text-9xl font-black text-primary text-glow animate-pulse"
          key={count}
        >
          {count === 0 ? "GO!" : count}
        </div>
      </div>
    </div>
  );
}
