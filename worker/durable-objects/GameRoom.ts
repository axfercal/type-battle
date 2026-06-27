import { DurableObject } from "cloudflare:workers";
import {
  isRoomClientMessage,
  type RoomServerMessage,
} from "../../shared/multiplayer/roomProtocol";
import type {
  PublicRoomState,
  RoomIdentityInput,
  RoomPlayer,
  RoomResult,
  RoomSeat,
  RoomSessionPayload,
} from "../../shared/multiplayer/roomTypes";

interface StoredRoomPlayer extends Omit<RoomPlayer, "connected"> {
  profileId: string;
  reconnectToken: string;
}

interface SocketAttachment {
  seat: RoomSeat;
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
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Expected a WebSocket upgrade.", { status: 426 });
    }

    const reconnectToken = new URL(request.url).searchParams.get("token");
    const room = await this.loadRoom();
    const player = room?.players.find(
      (candidate) => candidate.reconnectToken === reconnectToken,
    );
    if (!room || !player) {
      return new Response("Your room session is no longer valid.", { status: 401 });
    }

    for (const socket of this.ctx.getWebSockets()) {
      const attachment = socket.deserializeAttachment() as
        | SocketAttachment
        | null;
      if (attachment?.reconnectToken === reconnectToken) {
        socket.close(4001, "This room was opened in another tab.");
      }
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({
      seat: player.seat,
      reconnectToken: player.reconnectToken,
    } satisfies SocketAttachment);

    room.lastActivityAt = Date.now();
    await this.saveRoom(room);
    this.broadcastRoom(room);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(
    socket: WebSocket,
    rawMessage: string | ArrayBuffer,
  ): Promise<void> {
    try {
      const text =
        typeof rawMessage === "string"
          ? rawMessage
          : new TextDecoder().decode(rawMessage);
      const message: unknown = JSON.parse(text);
      if (!isRoomClientMessage(message)) {
        this.send(socket, {
          type: "error",
          message: "That lobby message is not supported.",
        });
        return;
      }

      if (message.type === "ping") {
        this.send(socket, { type: "pong" });
        return;
      }

      const room = await this.loadRoom();
      const attachment = socket.deserializeAttachment() as
        | SocketAttachment
        | null;
      const player = room?.players.find(
        (candidate) =>
          candidate.reconnectToken === attachment?.reconnectToken,
      );
      if (!room || !player) {
        this.send(socket, {
          type: "error",
          message: "Your room session is no longer valid.",
        });
        socket.close(4003, "Room session expired.");
        return;
      }

      this.sendSnapshot(socket, room, player.seat);
    } catch {
      this.send(socket, {
        type: "error",
        message: "The lobby could not read that message.",
      });
    }
  }

  async webSocketClose(
    socket: WebSocket,
    code: number,
    reason: string,
  ): Promise<void> {
    socket.close(code, reason);
    const room = await this.loadRoom();
    if (room) this.broadcastRoom(room);
  }

  async webSocketError(socket: WebSocket): Promise<void> {
    socket.close(1011, "Lobby connection failed.");
    const room = await this.loadRoom();
    if (room) this.broadcastRoom(room);
  }

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
    this.broadcastRoom(room);
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

    const [departingPlayer] = room.players.splice(playerIndex, 1);
    for (const socket of this.ctx.getWebSockets()) {
      const attachment = socket.deserializeAttachment() as
        | SocketAttachment
        | null;
      if (attachment?.reconnectToken === departingPlayer.reconnectToken) {
        socket.close(1000, "Left the room.");
      }
    }

    if (room.players.length === 0) {
      await this.ctx.storage.delete(ROOM_STORAGE_KEY);
      return { ok: true, data: { room: null } };
    }

    room.players[0].seat = "host";
    for (const socket of this.ctx.getWebSockets()) {
      const attachment = socket.deserializeAttachment() as
        | SocketAttachment
        | null;
      if (attachment?.reconnectToken === room.players[0].reconnectToken) {
        socket.serializeAttachment({
          ...attachment,
          seat: "host",
        } satisfies SocketAttachment);
      }
    }
    room.lastActivityAt = Date.now();
    await this.saveRoom(room);
    this.broadcastRoom(room);
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
    const connectedTokens = new Set(
      this.ctx.getWebSockets().flatMap((socket) => {
        const attachment = socket.deserializeAttachment() as
          | SocketAttachment
          | null;
        return attachment ? [attachment.reconnectToken] : [];
      }),
    );

    return {
      code: room.code,
      phase: room.phase,
      players: room.players.map(
        ({ seat, username, characterId, ready, reconnectToken }) => ({
          seat,
          username,
          characterId,
          ready,
          connected: connectedTokens.has(reconnectToken),
        }),
      ),
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

  private broadcastRoom(room: StoredRoomState): void {
    for (const socket of this.ctx.getWebSockets()) {
      const attachment = socket.deserializeAttachment() as
        | SocketAttachment
        | null;
      const player = room.players.find(
        (candidate) =>
          candidate.reconnectToken === attachment?.reconnectToken,
      );
      if (player) this.sendSnapshot(socket, room, player.seat);
    }
  }

  private sendSnapshot(
    socket: WebSocket,
    room: StoredRoomState,
    seat: RoomSeat,
  ): void {
    this.send(socket, {
      type: "room_snapshot",
      room: this.toPublicRoom(room),
      seat,
    });
  }

  private send(socket: WebSocket, message: RoomServerMessage): void {
    try {
      socket.send(JSON.stringify(message));
    } catch {
      // A closing socket will be removed before the next broadcast.
    }
  }
}
