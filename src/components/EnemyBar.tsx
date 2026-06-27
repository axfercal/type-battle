import { clamp } from "../utils/helpers";

interface EnemyBarProps {
  hp: number;
  maxHp: number;
}

export function EnemyBar({ hp, maxHp }: EnemyBarProps) {
  const percent = clamp((hp / maxHp) * 100, 0, 100);

  return (
    <div className="enemy-bar">
      <div className="enemy-bar__label">
        Enemy HP: {hp} / {maxHp}
      </div>
      <div className="enemy-bar__track" role="progressbar" aria-label="Enemy health" aria-valuemin={0} aria-valuemax={maxHp} aria-valuenow={hp}>
        <div
          className="enemy-bar__fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
