import { useState } from "react";
import type { FormEvent } from "react";

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

interface RoomEntryProps {
  username: string;
  loading: boolean;
  error: string | null;
  onCreate: () => Promise<void>;
  onJoin: (code: string) => Promise<void>;
}

function codeFromUrl(): string {
  const value = new URLSearchParams(window.location.search).get("room") ?? "";
  return value
    .toUpperCase()
    .split("")
    .filter((character) => ROOM_CODE_ALPHABET.includes(character))
    .slice(0, 6)
    .join("");
}

export function RoomEntry({
  username,
  loading,
  error,
  onCreate,
  onJoin,
}: RoomEntryProps) {
  const [mode, setMode] = useState<"create" | "join">(
    codeFromUrl() ? "join" : "create",
  );
  const [code, setCode] = useState(codeFromUrl);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "create") void onCreate();
    else if (code.length === 6) void onJoin(code);
  };

  return (
    <section className="start-card multiplayer-card">
      <div className="crest" aria-hidden="true">⚔</div>
      <p className="eyebrow">Live rooms</p>
      <h2 id="multiplayer-menu-title">Challenge a friend.</h2>
      <p className="start-copy">
        Playing as <strong>{username}</strong>. Create a private room or enter a code from another player.
      </p>

      <div className="room-tabs" role="tablist" aria-label="Room action">
        <button type="button" role="tab" aria-selected={mode === "create"} className={mode === "create" ? "active" : ""} onClick={() => setMode("create")}>Create room</button>
        <button type="button" role="tab" aria-selected={mode === "join"} className={mode === "join" ? "active" : ""} onClick={() => setMode("join")}>Join room</button>
      </div>

      <form className="room-entry-form" onSubmit={handleSubmit}>
        {mode === "create" ? (
          <div className="room-action-summary">
            <span aria-hidden="true">＋</span>
            <div><strong>Start a private duel</strong><small>We will generate a six-character invite code.</small></div>
          </div>
        ) : (
          <label htmlFor="room-code">
            Room code
            <input
              id="room-code"
              className="room-code-input"
              value={code}
              onChange={(event) => {
                const nextCode = event.target.value
                  .toUpperCase()
                  .split("")
                  .filter((character) => ROOM_CODE_ALPHABET.includes(character))
                  .slice(0, 6)
                  .join("");
                setCode(nextCode);
              }}
              placeholder="ABC234"
              autoComplete="off"
              autoFocus
              aria-describedby={error ? "room-entry-error" : undefined}
            />
          </label>
        )}

        {error && <p className="room-error" id="room-entry-error" role="alert">{error}</p>}
        <button className="primary-btn" type="submit" disabled={loading || (mode === "join" && code.length !== 6)}>
          {loading ? "Contacting arena…" : mode === "create" ? "Create room" : "Join room"}
        </button>
      </form>
    </section>
  );
}
