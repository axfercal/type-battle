import type { LocalProfile } from "../profile/profileTypes";
import type {
  PublicRoomState,
  RoomError,
  RoomSession,
  RoomSessionPayload,
} from "../../../shared/multiplayer/roomTypes";

interface RoomSnapshotPayload {
  room: PublicRoomState;
  seat: RoomSession["seat"];
}

interface ErrorPayload {
  error?: RoomError;
}

export class RoomApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(
    message: string,
    code = "UNKNOWN",
    status = 500,
  ) {
    super(message);
    this.name = "RoomApiError";
    this.code = code;
    this.status = status;
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & ErrorPayload;
  if (!response.ok) {
    throw new RoomApiError(
      body.error?.message ?? "The room request failed.",
      body.error?.code,
      response.status,
    );
  }
  return body;
}

function identity(profile: LocalProfile) {
  return { profileId: profile.id, username: profile.username };
}

export async function createRoom(
  profile: LocalProfile,
): Promise<RoomSessionPayload> {
  const response = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(identity(profile)),
  });
  return readResponse<RoomSessionPayload>(response);
}

export async function joinRoom(
  profile: LocalProfile,
  code: string,
): Promise<RoomSessionPayload> {
  const response = await fetch(`/api/rooms/${code}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(identity(profile)),
  });
  return readResponse<RoomSessionPayload>(response);
}

export async function getRoom(
  session: RoomSession,
): Promise<RoomSnapshotPayload> {
  const response = await fetch(`/api/rooms/${session.code}`, {
    headers: { Authorization: `Bearer ${session.reconnectToken}` },
  });
  return readResponse<RoomSnapshotPayload>(response);
}

export async function leaveRoom(session: RoomSession): Promise<void> {
  const response = await fetch(`/api/rooms/${session.code}/leave`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.reconnectToken}` },
  });
  await readResponse<{ room: PublicRoomState | null }>(response);
}
