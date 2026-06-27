import { useEffect, useRef, useState } from "react";
import type { GameStatus } from "../features/battle/battleTypes";
import { CHARACTER_ASSETS } from "../features/characters/characterAssets";
import { getCharacterDefinition } from "../../shared/characters/characterCatalog";
import type { CharacterId } from "../../shared/characters/characterCatalog";
import arenaBg from "../assets/Background4.jpg";

/** Delays returning true by `delayMs` after `trigger` becomes true. Returns false when trigger is false. */
function useDelayedFlag(trigger: boolean, delayMs: number): boolean {
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (trigger) {
      timerRef.current = setTimeout(() => setActive(true), delayMs);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setActive(false);
      };
    }
  }, [trigger, delayMs]);

  return trigger && active;
}

interface BattleArenaProps {
  gameStatus: GameStatus;
  playerCharacterId: CharacterId;
  enemyCharacterId: CharacterId;
}

export function BattleArena({
  gameStatus,
  playerCharacterId,
  enemyCharacterId,
}: BattleArenaProps) {
  const playerAttacking = gameStatus === "playerAttack";
  const enemyAttacking = gameStatus === "enemyAttack";

  const playerShowAttack = useDelayedFlag(playerAttacking, 300);
  const enemyShowAttack = useDelayedFlag(enemyAttacking, 300);

  const playerPose = CHARACTER_ASSETS[playerCharacterId].faceRight;
  const enemyPose = CHARACTER_ASSETS[enemyCharacterId].faceLeft;
  const playerSrc = playerShowAttack ? playerPose.attack : playerPose.idle;
  const enemySrc = enemyShowAttack ? enemyPose.attack : enemyPose.idle;
  const playerName = getCharacterDefinition(playerCharacterId).name;
  const enemyName = getCharacterDefinition(enemyCharacterId).name;

  const playerRef = useRef<HTMLDivElement>(null);
  const enemyRef = useRef<HTMLDivElement>(null);
  const [lungeDist, setLungeDist] = useState(0);

  // Force CSS animation restart by reflowing the element
  useEffect(() => {
    if (playerAttacking && playerRef.current) {
      const el = playerRef.current;
      el.classList.remove("knight--attacking-right");
      void el.offsetWidth; // trigger reflow
      el.classList.add("knight--attacking-right");
    }
  }, [playerAttacking]);

  useEffect(() => {
    if (enemyAttacking && enemyRef.current) {
      const el = enemyRef.current;
      el.classList.remove("knight--attacking-left");
      void el.offsetWidth; // trigger reflow
      el.classList.add("knight--attacking-left");
    }
  }, [enemyAttacking]);

  useEffect(() => {
    function measure() {
      if (playerRef.current && enemyRef.current) {
        const playerRect = playerRef.current.getBoundingClientRect();
        const enemyRect = enemyRef.current.getBoundingClientRect();
        setLungeDist(enemyRect.left - playerRect.right);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      className="arena"
      style={{
        backgroundImage: `url(${arenaBg})`,
        "--lunge-dist": `${lungeDist}px`,
      } as React.CSSProperties}
    >
      <div
        ref={playerRef}
        className={`knight knight--player ${playerAttacking ? "knight--attacking-right" : ""}`}
      >
        <img src={playerSrc} alt={playerName} />
      </div>

      <div
        ref={enemyRef}
        className={`knight knight--enemy ${enemyAttacking ? "knight--attacking-left" : ""}`}
      >
        <img src={enemySrc} alt={enemyName} />
      </div>
    </div>
  );
}
