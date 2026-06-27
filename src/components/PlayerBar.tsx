import { clamp } from "../utils/helpers";

interface PlayerBarProps {
  hp: number;
  maxHp: number;
}

export function PlayerBar({ hp, maxHp }: PlayerBarProps) {
  const percent = clamp((hp / maxHp) * 100, 0, 100);

  return (
    <div className="player-bar">
      <div className="player-bar__label">
        Player HP: {hp} / {maxHp}
      </div>
      <div className="player-bar__track" role="progressbar" aria-label="Your health" aria-valuemin={0} aria-valuemax={maxHp} aria-valuenow={hp}>
        <div
          className="player-bar__fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
