export interface TypingState {
  targetText: string;
  typedText: string;
  isActive: boolean;
  isFinished: boolean;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
}

export interface CharResult {
  char: string;
  status: "correct" | "incorrect" | "pending";
}
