import type { CharResult } from "../features/typing/typingTypes";

interface TextDisplayProps {
  charResults: CharResult[];
}

export function TextDisplay({ charResults }: TextDisplayProps) {
  return (
    <div className="text-display" aria-label="Text to type">
      {charResults.map((cr, i) => (
        <span
          key={i}
          className={`char char--${cr.status} ${i === charResults.findIndex((item) => item.status === "pending") ? "char--current" : ""}`}
        >
          {cr.char}
        </span>
      ))}
    </div>
  );
}
