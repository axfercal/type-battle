import { useEffect, useRef, useState } from "react";
import type { GameStatus } from "../features/battle/battleTypes";
import blueIdle from "../assets/BlueKnightIdle.png";
import blueAttackImg from "../assets/BlueKnightAttack.png";
import redIdle from "../assets/RedKnightInvertdIdle.png";
import redAttackImg from "../assets/RedKnightInvertedAttack.png";
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
}

export function BattleArena({ gameStatus }: BattleArenaProps) {
  const blueAttacking = gameStatus === "playerAttack";
  const redAttacking = gameStatus === "enemyAttack";

  const blueShowAttack = useDelayedFlag(blueAttacking, 300);
  const redShowAttack = useDelayedFlag(redAttacking, 300);

  const blueSrc = blueShowAttack ? blueAttackImg : blueIdle;
  const redSrc = redShowAttack ? redAttackImg : redIdle;

  const blueRef = useRef<HTMLDivElement>(null);
  const redRef = useRef<HTMLDivElement>(null);
  const [lungeDist, setLungeDist] = useState(0);

  // Force CSS animation restart by reflowing the element
  useEffect(() => {
    if (blueAttacking && blueRef.current) {
      const el = blueRef.current;
      el.classList.remove("knight--attacking-right");
      void el.offsetWidth; // trigger reflow
      el.classList.add("knight--attacking-right");
    }
  }, [blueAttacking]);

  useEffect(() => {
    if (redAttacking && redRef.current) {
      const el = redRef.current;
      el.classList.remove("knight--attacking-left");
      void el.offsetWidth; // trigger reflow
      el.classList.add("knight--attacking-left");
    }
  }, [redAttacking]);

  useEffect(() => {
    function measure() {
      if (blueRef.current && redRef.current) {
        const blueRect = blueRef.current.getBoundingClientRect();
        const redRect = redRef.current.getBoundingClientRect();
        setLungeDist(redRect.left - blueRect.right);
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
        ref={blueRef}
        className={`knight knight--blue ${blueAttacking ? "knight--attacking-right" : ""}`}
      >
        <img src={blueSrc} alt="Blue Knight" />
      </div>

      <div
        ref={redRef}
        className={`knight knight--red ${redAttacking ? "knight--attacking-left" : ""}`}
      >
        <img src={redSrc} alt="Red Knight" />
      </div>
    </div>
  );
}
