interface MainMenuProps {
  username: string;
  onSolo: () => void;
  onMultiplayer: () => void;
  onEditProfile: () => void;
}

export function MainMenu({
  username,
  onSolo,
  onMultiplayer,
  onEditProfile,
}: MainMenuProps) {
  return (
    <main className="main-menu" aria-labelledby="main-menu-title">
      <section className="start-card game-menu">
        <div className="crest" aria-hidden="true">⚔</div>
        <p className="eyebrow">Welcome back, {username}</p>
        <h2 id="main-menu-title">Choose your battle.</h2>
        <p className="start-copy">
          Sharpen your skills against a rival or prepare for a live duel with a friend.
        </p>

        <div className="mode-options">
          <button className="mode-card" type="button" onClick={onSolo}>
            <span className="mode-icon" aria-hidden="true">♞</span>
            <span className="mode-copy">
              <strong>Solo battle</strong>
              <small>Fight a computer-controlled rival</small>
            </span>
            <span className="mode-arrow" aria-hidden="true">→</span>
          </button>

          <button className="mode-card mode-card--featured" type="button" onClick={onMultiplayer}>
            <span className="mode-badge">New</span>
            <span className="mode-icon" aria-hidden="true">⚔</span>
            <span className="mode-copy">
              <strong>Multiplayer</strong>
              <small>Create a room or join a friend</small>
            </span>
            <span className="mode-arrow" aria-hidden="true">→</span>
          </button>
        </div>

        <button className="text-btn menu-profile-link" type="button" onClick={onEditProfile}>
          Edit local profile
        </button>
      </section>
    </main>
  );
}
