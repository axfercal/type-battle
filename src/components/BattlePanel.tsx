import { useEffect, useRef, useState } from "react";
import { useTyping } from "../features/typing/useTyping";
import { useBattle } from "../features/battle/useBattle";
import { DIFFICULTIES, MAX_HP } from "../features/battle/battleTypes";
import type { Difficulty } from "../features/battle/battleTypes";
import { TextDisplay } from "./TextDisplay";
import { TypingBox } from "./TypingBox";
import { StatsPanel } from "./StatsPanel";
import { EnemyBar } from "./EnemyBar";
import { PlayerBar } from "./PlayerBar";
import { BattleArena } from "./BattleArena";

interface BattlePanelProps {
  onExit: () => void;
}

export function BattlePanel({ onExit }: BattlePanelProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("knight");
  const [hasStarted, setHasStarted] = useState(false);
  const { state, charResults, handleInput, getStats, restart } = useTyping();
  const { battle, playerAttack, resetBattle } = useBattle(difficulty);
  const attackedRef = useRef(false);
  const prevGameStatusRef = useRef(battle.gameStatus);

  const stats = getStats();

  // When typing finishes, trigger player attack
  useEffect(() => {
    if (state.isFinished && !attackedRef.current) {
      attackedRef.current = true;
      const finalStats = getStats();
      playerAttack(finalStats.wpm, finalStats.accuracy / 100);
    }
  }, [state.isFinished, getStats, playerAttack]);

  // When battle returns to typing, start next round
  useEffect(() => {
    if (
      prevGameStatusRef.current !== "typing" &&
      battle.gameStatus === "typing"
    ) {
      attackedRef.current = false;
      restart();
    }
    prevGameStatusRef.current = battle.gameStatus;
  }, [battle.gameStatus, restart]);

  const handleNewGame = () => {
    attackedRef.current = false;
    resetBattle();
    restart();
  };

  const handleStart = () => {
    handleNewGame();
    setHasStarted(true);
  };

  if (!hasStarted) {
    return (
      <section className="start-card">
        <div className="crest" aria-hidden="true">⚔</div>
        <p className="eyebrow">A typing battle</p>
        <h2>Win with every word.</h2>
        <p className="start-copy">
          Type each line quickly and accurately to strike. After every attack,
          your rival strikes back.
        </p>

        <fieldset className="difficulty-picker">
          <legend>Choose your rival</legend>
          <div className="difficulty-options">
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map((level) => (
              <label className={`difficulty-option ${difficulty === level ? "difficulty-option--selected" : ""}`} key={level}>
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={difficulty === level}
                  onChange={() => setDifficulty(level)}
                />
                <strong>{DIFFICULTIES[level].label}</strong>
                <span>{DIFFICULTIES[level].description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button className="primary-btn" onClick={handleStart}>Enter the arena</button>
        <button className="text-btn solo-back-btn" type="button" onClick={onExit}>Back to main menu</button>
        <p className="start-tip">No account needed · Best with a keyboard</p>
      </section>
    );
  }

  const isInputDisabled =
    state.isFinished || battle.gameStatus !== "typing";

  return (
    <div className="battle-panel">
      <div className="screen-toolbar">
        <button className="back-btn" type="button" onClick={onExit}>← Main menu</button>
        <span>Solo battle</span>
      </div>
      <div className="battle-heading">
        <span>Round {battle.round}</span>
        <span>{DIFFICULTIES[difficulty].label} duel</span>
      </div>
      <div className="hp-bars">
        <PlayerBar hp={battle.playerHp} maxHp={MAX_HP} />
        <EnemyBar hp={battle.enemyHp} maxHp={MAX_HP} />
      </div>

      <BattleArena gameStatus={battle.gameStatus} />

      {battle.gameStatus !== "finished" && (
        <>
          <TextDisplay charResults={charResults} />

          <TypingBox
            value={state.typedText}
            onChange={handleInput}
            disabled={isInputDisabled}
          />

          <StatsPanel stats={stats} />
        </>
      )}

      {battle.gameStatus === "playerAttack" && (
        <div className="battle-msg battle-msg--player" role="status">
          You dealt <strong>{battle.lastPlayerDamage}</strong> damage!
        </div>
      )}

      {battle.gameStatus === "enemyAttack" && (
        <div className="battle-msg battle-msg--enemy" role="status">
          Enemy dealt <strong>{battle.lastEnemyDamage}</strong> damage!
        </div>
      )}

      {battle.gameStatus === "finished" && (
        <div className="battle-finished">
          <h2 className={`result result--${battle.winner}`}>
            {battle.winner === "player" ? "You Win!" : "You Lose!"}
          </h2>
          <p>
            Final HP — You: {battle.playerHp} | Enemy: {battle.enemyHp}
          </p>
          <button className="restart-btn" onClick={handleNewGame}>
            Rematch
          </button>
          <button className="text-btn" onClick={() => setHasStarted(false)}>
            Change difficulty
          </button>
          <button className="text-btn" onClick={onExit}>
            Main menu
          </button>
        </div>
      )}
    </div>
  );
}
