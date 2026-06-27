import type { RoomSession } from "../../../shared/multiplayer/roomTypes";

const ROOM_SESSION_KEY = "typeblade.room-session.v1";

function isRoomSession(value: unknown): value is RoomSession {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RoomSession>;
  return (
    typeof candidate.code === "string" &&
    candidate.code.length === 6 &&
    (candidate.seat === "host" || candidate.seat === "guest") &&
    typeof candidate.reconnectToken === "string" &&
    candidate.reconnectToken.length > 0
  );
}

export function loadRoomSession(): RoomSession | null {
  try {
    const stored = sessionStorage.getItem(ROOM_SESSION_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    return isRoomSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveRoomSession(session: RoomSession): void {
  sessionStorage.setItem(ROOM_SESSION_KEY, JSON.stringify(session));
}

export function clearRoomSession(): void {
  sessionStorage.removeItem(ROOM_SESSION_KEY);
}
