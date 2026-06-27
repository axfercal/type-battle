import type { CharResult } from "./typingTypes";

export function calculateWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const words = correctChars / 5;
  return Math.round(words / minutes);
}

export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}

export function getCharResults(targetText: string, typedText: string): CharResult[] {
  return targetText.split("").map((char, i) => {
    if (i >= typedText.length) {
      return { char, status: "pending" };
    }
    return {
      char,
      status: typedText[i] === char ? "correct" : "incorrect",
    };
  });
}
