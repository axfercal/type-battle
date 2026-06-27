interface TypingBoxProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function TypingBox({ value, onChange, disabled }: TypingBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  return (
    <div className="typing-box">
      <input
        ref={inputRef}
        type="text"
        className="typing-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Start typing..."
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Type the sentence shown above"
        onPaste={(event) => event.preventDefault()}
      />
    </div>
  );
}
import { useEffect, useRef } from "react";
