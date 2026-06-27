import { DurableObject } from "cloudflare:workers";
import type {
  PublicRoomState,
  RoomIdentityInput,
  RoomPlayer,
  RoomResult,
  RoomSeat,
  RoomSessionPayload,
} from "../../shared/multiplayer/roomTypes";

interface StoredRoomPlayer extends RoomPlayer {
  profileId: string;
  reconnectToken: string;
}

interface StoredRoomState {
  code: string;
  phase: "lobby";
  players: StoredRoomPlayer[];
  createdAt: number;
  lastActivityAt: number;
}

const ROOM_STORAGE_KEY = "room";

export class GameRoom extends DurableObject {
  async createRoom(
    code: string,
    identity: RoomIdentityInput,
  ): Promise<RoomResult<RoomSessionPayload>> {
    if (await this.loadRoom()) {
      return {
        ok: false,
        error: { code: "ROOM_EXISTS", message: "That room code is already in use." },
      };
    }

    const now = Date.now();
    const host = this.createPlayer("host", identity);
    const room: StoredRoomState = {
      code,
      phase: "lobby",
      players: [host],
      createdAt: now,
      lastActivityAt: now,
    };
    await this.saveRoom(room);
    return { ok: true, data: this.sessionPayload(room, host) };
  }

  async joinRoom(
    identity: RoomIdentityInput,
  ): Promise<RoomResult<RoomSessionPayload>> {
    const room = await this.loadRoom();
    if (!room) {
      return {
        ok: false,
        error: { code: "ROOM_NOT_FOUND", message: "That room does not exist." },
      };
    }

    if (room.players.some((player) => player.profileId === identity.profileId)) {
      return {
        ok: false,
        error: {
          code: "ALREADY_JOINED",
          message: "This profile already has a seat in the room.",
        },
      };
    }

    if (room.players.length >= 2) {
      return {
        ok: false,
        error: { code: "ROOM_FULL", message: "This room already has two players." },
      };
    }

    const availableSeat: RoomSeat = room.players.some(
      (player) => player.seat === "host",
    )
      ? "guest"
      : "host";
    const guest = this.createPlayer(availableSeat, identity);
    room.players.push(guest);
    room.lastActivityAt = Date.now();
    await this.saveRoom(room);
    return { ok: true, data: this.sessionPayload(room, guest) };
  }

  async getRoom(
    reconnectToken: string,
  ): Promise<RoomResult<{ room: PublicRoomState; seat: RoomSeat }>> {
    const room = await this.loadRoom();
    if (!room) {
      return {
        ok: false,
        error: { code: "ROOM_NOT_FOUND", message: "That room does not exist." },
      };
    }

    const player = room.players.find(
      (candidate) => candidate.reconnectToken === reconnectToken,
    );
    if (!player) {
      return {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Your room session is no longer valid." },
      };
    }

    room.lastActivityAt = Date.now();
    await this.saveRoom(room);
    return {
      ok: true,
      data: { room: this.toPublicRoom(room), seat: player.seat },
    };
  }

  async leaveRoom(
    reconnectToken: string,
  ): Promise<RoomResult<{ room: PublicRoomState | null }>> {
    const room = await this.loadRoom();
    if (!room) {
      return {
        ok: false,
        error: { code: "ROOM_NOT_FOUND", message: "That room does not exist." },
      };
    }

    const playerIndex = room.players.findIndex(
      (candidate) => candidate.reconnectToken === reconnectToken,
    );
    if (playerIndex === -1) {
      return {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Your room session is no longer valid." },
      };
    }

    room.players.splice(playerIndex, 1);
    if (room.players.length === 0) {
      await this.ctx.storage.delete(ROOM_STORAGE_KEY);
      return { ok: true, data: { room: null } };
    }

    room.players[0].seat = "host";
    room.lastActivityAt = Date.now();
    await this.saveRoom(room);
    return { ok: true, data: { room: this.toPublicRoom(room) } };
  }

  private createPlayer(
    seat: RoomSeat,
    identity: RoomIdentityInput,
  ): StoredRoomPlayer {
    return {
      seat,
      profileId: identity.profileId,
      username: identity.username,
      reconnectToken: crypto.randomUUID(),
      characterId: null,
      ready: false,
    };
  }

  private sessionPayload(
    room: StoredRoomState,
    player: StoredRoomPlayer,
  ): RoomSessionPayload {
    return {
      session: {
        code: room.code,
        seat: player.seat,
        reconnectToken: player.reconnectToken,
      },
      room: this.toPublicRoom(room),
    };
  }

  private toPublicRoom(room: StoredRoomState): PublicRoomState {
    return {
      code: room.code,
      phase: room.phase,
      players: room.players.map(({ seat, username, characterId, ready }) => ({
        seat,
        username,
        characterId,
        ready,
      })),
      createdAt: room.createdAt,
      lastActivityAt: room.lastActivityAt,
    };
  }

  private loadRoom(): Promise<StoredRoomState | undefined> {
    return this.ctx.storage.get<StoredRoomState>(ROOM_STORAGE_KEY);
  }

  private saveRoom(room: StoredRoomState): Promise<void> {
    return this.ctx.storage.put(ROOM_STORAGE_KEY, room);
  }
}
