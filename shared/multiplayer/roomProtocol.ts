import type { PublicRoomState, RoomSeat } from "./roomTypes";

export type RoomClientMessage =
  | { type: "request_snapshot" }
  | { type: "ping" };

export type RoomServerMessage =
  | { type: "room_snapshot"; room: PublicRoomState; seat: RoomSeat }
  | { type: "pong" }
  | { type: "error"; message: string };

export function isRoomClientMessage(value: unknown): value is RoomClientMessage {
  if (!value || typeof value !== "object" || !("type" in value)) return false;
  return value.type === "request_snapshot" || value.type === "ping";
}
