import type { LocalProfile } from "../profile/profileTypes";
import { RoomEntry } from "../multiplayer/RoomEntry";
import { RoomLobby } from "../multiplayer/RoomLobby";
import { useRoom } from "../multiplayer/useRoom";

interface MultiplayerMenuProps {
  profile: LocalProfile;
  onBack: () => void;
}

export function MultiplayerMenu({ profile, onBack }: MultiplayerMenuProps) {
  const roomState = useRoom(profile);
  const loading = roomState.status === "loading";

  return (
    <main className="multiplayer-menu" aria-labelledby="multiplayer-menu-title">
      <div className="screen-toolbar">
        <button className="back-btn" type="button" onClick={onBack}>← Main menu</button>
        <span>{roomState.session ? `Room ${roomState.session.code}` : "Multiplayer"}</span>
      </div>

      {roomState.session && roomState.room ? (
        <RoomLobby
          room={roomState.room}
          session={roomState.session}
          loading={loading}
          error={roomState.error}
          onRefresh={roomState.refreshRoom}
          onLeave={roomState.leaveRoom}
        />
      ) : roomState.session ? (
        <section className="start-card multiplayer-card room-loading">
          <div className="connection-spinner" aria-hidden="true" />
          <p className="eyebrow">Room {roomState.session.code}</p>
          <h2 id="multiplayer-menu-title">Restoring your seat…</h2>
          <p className="start-copy">Checking the saved room session.</p>
          {roomState.error && <p className="room-error" role="alert">{roomState.error}</p>}
          <button className="text-btn" type="button" onClick={() => void roomState.leaveRoom()}>Forget this room</button>
        </section>
      ) : (
        <RoomEntry
          username={profile.username}
          loading={loading}
          error={roomState.error}
          onCreate={roomState.createRoom}
          onJoin={roomState.joinRoom}
        />
      )}
    </main>
  );
}
