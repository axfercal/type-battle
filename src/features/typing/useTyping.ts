import { useState, useCallback } from "react";
import { useTimer } from "../../hooks/useTimer";
import { calculateWPM, calculateAccuracy, getCharResults } from "./typingUtils";
import { getRandomText } from "../../utils/helpers";
import type { TypingState, TypingStats, CharResult } from "./typingTypes";

const initialText = getRandomText();

export function useTyping() {
  const [state, setState] = useState<TypingState>({
    targetText: initialText,
    typedText: "",
    isActive: false,
    isFinished: false,
  });

  const { getElapsed, reset: resetTimer } = useTimer(state.isActive);

  const handleInput = useCallback(
    (value: string) => {
      setState((prev) => {
        if (prev.isFinished) return prev;

        const isActive = value.length > 0;
        const isFinished = value.length >= prev.targetText.length;

        return {
          ...prev,
          typedText: value.slice(0, prev.targetText.length),
          isActive: isFinished ? false : isActive,
          isFinished,
        };
      });
    },
    []
  );

  const getStats = useCallback((): TypingStats => {
    const elapsed = getElapsed();
    const chars = state.targetText.split("");
    const correctChars = chars.filter(
      (c, i) => i < state.typedText.length && state.typedText[i] === c
    ).length;
    const totalChars = state.typedText.length;

    return {
      wpm: calculateWPM(correctChars, elapsed),
      accuracy: calculateAccuracy(correctChars, totalChars),
      correctChars,
      totalChars,
    };
  }, [getElapsed, state.targetText, state.typedText]);

  const charResults: CharResult[] = getCharResults(
    state.targetText,
    state.typedText
  );

  const restart = useCallback(() => {
    resetTimer();
    setState({
      targetText: getRandomText(),
      typedText: "",
      isActive: false,
      isFinished: false,
    });
  }, [resetTimer]);

  return {
    state,
    charResults,
    handleInput,
    getStats,
    restart,
  };
}
