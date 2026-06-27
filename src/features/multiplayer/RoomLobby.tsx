import { useState } from "react";
import type {
  PublicRoomState,
  RoomSession,
} from "../../../shared/multiplayer/roomTypes";

interface RoomLobbyProps {
  room: PublicRoomState;
  session: RoomSession;
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  onLeave: () => Promise<void>;
}

export function RoomLobby({
  room,
  session,
  loading,
  error,
  onRefresh,
  onLeave,
}: RoomLobbyProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const host = room.players.find((player) => player.seat === "host");
  const guest = room.players.find((player) => player.seat === "guest");

  const copyInvite = async () => {
    try {
      const inviteUrl = new URL(window.location.href);
      inviteUrl.searchParams.set("room", room.code);
      await navigator.clipboard.writeText(inviteUrl.toString());
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <section className="start-card multiplayer-card room-lobby" aria-labelledby="room-title">
      <p className="eyebrow">Private room</p>
      <h2 id="room-title">Room {room.code}</h2>
      <p className="start-copy">
        Share the invite code with one rival. Live lobby updates arrive in the next step.
      </p>

      <button className="invite-code" type="button" onClick={() => void copyInvite()}>
        <span>{room.code}</span>
        <small>
          {copyStatus === "copied"
            ? "Invite link copied"
            : copyStatus === "error"
              ? "Copy blocked — share the code"
              : "Copy invite link"}
        </small>
      </button>

      <div className="lobby-players">
        {[host, guest].map((player, index) => (
          <div className={`lobby-player ${player?.seat === session.seat ? "lobby-player--you" : ""}`} key={player?.seat ?? `empty-${index}`}>
            <span className={`lobby-seat ${player ? "lobby-seat--filled" : ""}`} aria-hidden="true" />
            <strong>{player?.username ?? "Waiting for rival…"}</strong>
            <small>{player ? (player.seat === session.seat ? "You" : "Rival") : "Open seat"}</small>
          </div>
        ))}
      </div>

      {error && <p className="room-error" role="alert">{error}</p>}
      <div className="lobby-actions">
        <button className="secondary-btn" type="button" disabled={loading} onClick={() => void onRefresh()}>
          {loading ? "Refreshing…" : "Refresh lobby"}
        </button>
        <button className="text-btn" type="button" onClick={() => void onLeave()}>Leave room</button>
      </div>
    </section>
  );
}
