interface MultiplayerMenuProps {
  onBack: () => void;
}

export function MultiplayerMenu({ onBack }: MultiplayerMenuProps) {
  return (
    <main className="multiplayer-menu" aria-labelledby="multiplayer-menu-title">
      <div className="screen-toolbar">
        <button className="back-btn" type="button" onClick={onBack}>← Main menu</button>
        <span>Multiplayer</span>
      </div>

      <section className="start-card multiplayer-card">
        <div className="crest" aria-hidden="true">⚔</div>
        <p className="eyebrow">Live rooms</p>
        <h2 id="multiplayer-menu-title">Challenge a friend.</h2>
        <p className="start-copy">
          Create a private room and share its code, or enter a code from another player.
        </p>

        <div className="room-action-grid" aria-describedby="room-foundation-note">
          <button className="room-action" type="button" disabled>
            <span aria-hidden="true">＋</span>
            <strong>Create room</strong>
            <small>Start a private duel</small>
          </button>
          <button className="room-action" type="button" disabled>
            <span aria-hidden="true">#</span>
            <strong>Join room</strong>
            <small>Enter a six-character code</small>
          </button>
        </div>

        <p className="foundation-note" id="room-foundation-note">
          Room creation and joining arrive in the next multiplayer milestone.
        </p>
      </section>
    </main>
  );
}
