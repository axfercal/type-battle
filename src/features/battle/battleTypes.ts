export type GameStatus = "typing" | "playerAttack" | "enemyAttack" | "finished";

export interface BattleState {
  playerHp: number;
  enemyHp: number;
  gameStatus: GameStatus;
  lastPlayerDamage: number;
  lastEnemyDamage: number;
  winner: "player" | "enemy" | null;
  round: number;
}

export const MAX_HP = 100;
export const ATTACK_ANIM_MS = 1200;

export type Difficulty = "squire" | "knight" | "warlord";

export const DIFFICULTIES: Record<
  Difficulty,
  { label: string; description: string; botWpm: [number, number]; botAccuracy: [number, number] }
> = {
  squire: {
    label: "Squire",
    description: "A forgiving first duel",
    botWpm: [22, 34],
    botAccuracy: [0.8, 0.9],
  },
  knight: {
    label: "Knight",
    description: "A fair, brisk challenge",
    botWpm: [34, 48],
    botAccuracy: [0.86, 0.95],
  },
  warlord: {
    label: "Warlord",
    description: "Fast and punishing",
    botWpm: [48, 64],
    botAccuracy: [0.92, 0.99],
  },
};
