interface CalorieRingProps {
  current: number;
  goal: number;
  size?: number;
}

const CalorieRing = ({ current, goal, size = 160 }: CalorieRingProps) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const remaining = Math.max(goal - current, 0);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{
            filter: "drop-shadow(0 0 6px hsl(82 85% 50% / 0.4))",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold font-display text-foreground">{Math.round(remaining)}</span>
        <span className="text-[11px] font-medium text-muted-foreground">restantes</span>
      </div>
    </div>
  );
};

export default CalorieRing;
