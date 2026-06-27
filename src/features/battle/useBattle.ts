import { useState, useCallback, useRef, useEffect } from "react";
import type { BattleState } from "./battleTypes";
import {
  MAX_HP,
  ATTACK_ANIM_MS,
  DIFFICULTIES,
} from "./battleTypes";
import type { Difficulty } from "./battleTypes";
import { clamp } from "../../utils/helpers";

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function calcDamage(wpm: number, accuracy: number): number {
  return clamp(Math.round(wpm * accuracy * 0.8), 1, 65);
}

const initialState: BattleState = {
  playerHp: MAX_HP,
  enemyHp: MAX_HP,
  gameStatus: "typing",
  lastPlayerDamage: 0,
  lastEnemyDamage: 0,
  winner: null,
  round: 1,
};

export function useBattle(difficulty: Difficulty) {
  const [battle, setBattle] = useState<BattleState>(initialState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const playerAttack = useCallback((wpm: number, accuracy: number) => {
    const damage = calcDamage(wpm, accuracy);

    setBattle((prev) => {
      if (prev.gameStatus !== "typing") return prev;

      const newEnemyHp = Math.max(0, prev.enemyHp - damage);

      return {
        ...prev,
        enemyHp: newEnemyHp,
        lastPlayerDamage: damage,
        gameStatus: "playerAttack",
        winner: newEnemyHp <= 0 ? "player" : null,
      };
    });
  }, []);

  // Schedule bot turn after player attack animation (or finish if enemy died)
  useEffect(() => {
    if (battle.gameStatus !== "playerAttack") return;

    timerRef.current = setTimeout(() => {
      // If the player already won, go to finished
      if (battle.winner === "player") {
        setBattle((prev) => ({ ...prev, gameStatus: "finished" }));
        return;
      }

      const config = DIFFICULTIES[difficulty];
      const botWpm = randomInRange(...config.botWpm);
      const botAccuracy = randomInRange(...config.botAccuracy);
      const botDamage = calcDamage(botWpm, botAccuracy);

      setBattle((prev) => {
        const newPlayerHp = Math.max(0, prev.playerHp - botDamage);

        return {
          ...prev,
          playerHp: newPlayerHp,
          lastEnemyDamage: botDamage,
          gameStatus: "enemyAttack",
          winner: newPlayerHp <= 0 ? "enemy" : null,
        };
      });
    }, ATTACK_ANIM_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [battle.gameStatus, battle.winner, difficulty]);
  useEffect(() => {
    if (battle.gameStatus !== "enemyAttack") return;

    timerRef.current = setTimeout(() => {
      setBattle((prev) => ({
        ...prev,
        gameStatus: prev.winner === "enemy" ? "finished" : "typing",
        round: prev.winner === "enemy" ? prev.round : prev.round + 1,
      }));
    }, ATTACK_ANIM_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [battle.gameStatus]);

  const resetBattle = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setBattle(initialState);
  }, []);

  return { battle, playerAttack, resetBattle };
}
