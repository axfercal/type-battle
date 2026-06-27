import type { CharacterId } from "../characters/characterCatalog";

export type RoomSeat = "host" | "guest";
export type RoomPhase = "lobby";

export interface RoomPlayer {
  seat: RoomSeat;
  username: string;
  characterId: CharacterId | null;
  ready: boolean;
  connected: boolean;
}

export interface PublicRoomState {
  code: string;
  phase: RoomPhase;
  players: RoomPlayer[];
  createdAt: number;
  lastActivityAt: number;
}

export interface RoomSession {
  code: string;
  seat: RoomSeat;
  reconnectToken: string;
}

export interface RoomSessionPayload {
  session: RoomSession;
  room: PublicRoomState;
}

export interface RoomIdentityInput {
  profileId: string;
  username: string;
}

export type RoomErrorCode =
  | "INVALID_REQUEST"
  | "ROOM_EXISTS"
  | "ROOM_NOT_FOUND"
  | "ROOM_FULL"
  | "ALREADY_JOINED"
  | "UNAUTHORIZED";

export interface RoomError {
  code: RoomErrorCode;
  message: string;
}

export type RoomResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: RoomError };
