import type { TypingStats } from "../features/typing/typingTypes";

interface StatsPanelProps {
  stats: TypingStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="stats-panel">
      <div className="stat">
        <span className="stat-label">WPM</span>
        <span className="stat-value">{stats.wpm}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Accuracy</span>
        <span className="stat-value">{stats.accuracy}%</span>
      </div>
    </div>
  );
}
