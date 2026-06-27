import { GameRoom } from "./durable-objects/GameRoom";
import { createRoomCode, normalizeRoomCode } from "./services/roomCodes";
import { readBearerToken, readRoomIdentity } from "./services/requestValidation";
import type {
  RoomError,
  RoomResult,
  RoomSessionPayload,
} from "../shared/multiplayer/roomTypes";

export { GameRoom };

interface Env {
  GAME_ROOMS: DurableObjectNamespace<GameRoom>;
}

function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });
}

function errorStatus(error: RoomError): number {
  switch (error.code) {
    case "INVALID_REQUEST":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "ROOM_NOT_FOUND":
      return 404;
    case "ROOM_EXISTS":
    case "ROOM_FULL":
    case "ALREADY_JOINED":
      return 409;
  }
}

function roomResult<T>(result: RoomResult<T>): Response {
  return result.ok
    ? json(result.data)
    : json({ error: result.error }, { status: errorStatus(result.error) });
}

async function createRoom(request: Request, env: Env): Promise<Response> {
  const identity = await readRoomIdentity(request);
  if (!identity) {
    return json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "A valid local profile is required to create a room.",
        },
      },
      { status: 400 },
    );
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = createRoomCode();
    const room = env.GAME_ROOMS.getByName(code);
    const result: RoomResult<RoomSessionPayload> = await room.createRoom(
      code,
      identity,
    );
    if (result.ok || result.error.code !== "ROOM_EXISTS") {
      return roomResult(result);
    }
  }

  return json(
    {
      error: {
        code: "ROOM_EXISTS",
        message: "Could not reserve a room code. Please try again.",
      },
    },
    { status: 503 },
  );
}

async function joinRoom(
  request: Request,
  env: Env,
  code: string,
): Promise<Response> {
  const identity = await readRoomIdentity(request);
  if (!identity) {
    return json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "A valid local profile is required to join a room.",
        },
      },
      { status: 400 },
    );
  }

  const room = env.GAME_ROOMS.getByName(code);
  return roomResult(await room.joinRoom(identity));
}

async function getRoom(
  request: Request,
  env: Env,
  code: string,
): Promise<Response> {
  const token = readBearerToken(request);
  if (!token) {
    return json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "A room session token is required.",
        },
      },
      { status: 401 },
    );
  }

  const room = env.GAME_ROOMS.getByName(code);
  return roomResult(await room.getRoom(token));
}

async function leaveRoom(
  request: Request,
  env: Env,
  code: string,
): Promise<Response> {
  const token = readBearerToken(request);
  if (!token) {
    return json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "A room session token is required.",
        },
      },
      { status: 401 },
    );
  }

  const room = env.GAME_ROOMS.getByName(code);
  return roomResult(await room.leaveRoom(token));
}

function connectRoom(
  request: Request,
  env: Env,
  code: string,
): Response | Promise<Response> {
  if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "This endpoint requires a WebSocket connection.",
        },
      },
      { status: 426 },
    );
  }

  return env.GAME_ROOMS.getByName(code).fetch(request);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({ ok: true, service: "typeblade" });
    }

    if (request.method === "POST" && url.pathname === "/api/rooms") {
      return createRoom(request, env);
    }

    const socketMatch = url.pathname.match(/^\/api\/rooms\/([^/]+)\/socket$/);
    if (socketMatch) {
      const code = normalizeRoomCode(socketMatch[1]);
      if (!code) {
        return json(
          {
            error: {
              code: "INVALID_REQUEST",
              message: "Room codes contain six letters or numbers.",
            },
          },
          { status: 400 },
        );
      }

      if (request.method === "GET") return connectRoom(request, env, code);
    }

    const match = url.pathname.match(
      /^\/api\/rooms\/([^/]+?)(\/(?:join|leave))?$/,
    );
    if (match) {
      const code = normalizeRoomCode(match[1]);
      if (!code) {
        return json(
          {
            error: {
              code: "INVALID_REQUEST",
              message: "Room codes contain six letters or numbers.",
            },
          },
          { status: 400 },
        );
      }

      if (request.method === "POST" && match[2] === "/join") {
        return joinRoom(request, env, code);
      }

      if (request.method === "POST" && match[2] === "/leave") {
        return leaveRoom(request, env, code);
      }

      if (request.method === "GET" && !match[2]) {
        return getRoom(request, env, code);
      }
    }

    return json({ error: { code: "NOT_FOUND", message: "Not found." } }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
