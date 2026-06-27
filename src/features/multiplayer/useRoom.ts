import { useCallback, useEffect, useRef, useState } from "react";
import type { RoomServerMessage } from "../../../shared/multiplayer/roomProtocol";
import type {
  PublicRoomState,
  RoomSession,
} from "../../../shared/multiplayer/roomTypes";
import type { LocalProfile } from "../profile/profileTypes";
import {
  RoomApiError,
  createRoom as requestCreateRoom,
  getRoom as requestRoom,
  joinRoom as requestJoinRoom,
  leaveRoom as requestLeaveRoom,
} from "./roomApi";
import {
  clearRoomSession,
  loadRoomSession,
  saveRoomSession,
} from "./roomSessionStorage";

type RoomStatus = "idle" | "loading" | "ready" | "error";
export type RoomConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

const RECONNECT_DELAY_MS = 1_500;

export function useRoom(profile: LocalProfile) {
  const [initialSession] = useState(loadRoomSession);
  const [session, setSession] = useState<RoomSession | null>(initialSession);
  const [room, setRoom] = useState<PublicRoomState | null>(null);
  const [status, setStatus] = useState<RoomStatus>(
    initialSession ? "loading" : "idle",
  );
  const [connectionStatus, setConnectionStatus] =
    useState<RoomConnectionStatus>(
      initialSession ? "connecting" : "disconnected",
    );
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const shouldReconnectRef = useRef(Boolean(initialSession));

  const sessionCode = session?.code;
  const reconnectToken = session?.reconnectToken;

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    void requestRoom(session)
      .then((payload) => {
        if (cancelled) return;
        if (payload.seat !== session.seat) {
          const nextSession = { ...session, seat: payload.seat };
          saveRoomSession(nextSession);
          setSession(nextSession);
        }
        setRoom(payload.room);
        setStatus("ready");
        setError(null);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        if (
          cause instanceof RoomApiError &&
          (cause.code === "UNAUTHORIZED" || cause.code === "ROOM_NOT_FOUND")
        ) {
          shouldReconnectRef.current = false;
          clearRoomSession();
          setSession(null);
          setRoom(null);
          setConnectionStatus("error");
        }
        setStatus("error");
        setError(cause instanceof Error ? cause.message : "Could not restore the room.");
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!sessionCode || !reconnectToken || !shouldReconnectRef.current) {
      return;
    }

    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    const socketUrl = new URL(
      `/api/rooms/${sessionCode}/socket`,
      window.location.origin,
    );
    socketUrl.protocol = socketUrl.protocol === "https:" ? "wss:" : "ws:";
    socketUrl.searchParams.set("token", reconnectToken);

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      if (disposed) return;
      setConnectionStatus("connected");
      setError(null);
      socket.send(JSON.stringify({ type: "request_snapshot" }));
    });

    socket.addEventListener("message", (event) => {
      if (disposed || typeof event.data !== "string") return;
      try {
        const message = JSON.parse(event.data) as RoomServerMessage;
        if (message.type === "room_snapshot") {
          setRoom(message.room);
          setStatus("ready");
          setSession((currentSession) => {
            if (!currentSession || currentSession.seat === message.seat) {
              return currentSession;
            }
            const nextSession = { ...currentSession, seat: message.seat };
            saveRoomSession(nextSession);
            return nextSession;
          });
        } else if (message.type === "error") {
          setError(message.message);
        }
      } catch {
        setError("The lobby received an unreadable update.");
      }
    });

    socket.addEventListener("close", (event) => {
      if (socketRef.current === socket) socketRef.current = null;
      if (disposed || !shouldReconnectRef.current) return;

      if (event.code === 4001) {
        shouldReconnectRef.current = false;
        setConnectionStatus("error");
        setError("This room is open in another tab.");
        return;
      }

      if (event.code === 4003) {
        shouldReconnectRef.current = false;
        clearRoomSession();
        setSession(null);
        setRoom(null);
        setStatus("error");
        setConnectionStatus("error");
        setError("Your room session has expired.");
        return;
      }

      setConnectionStatus("reconnecting");
      reconnectTimer = setTimeout(() => {
        setReconnectAttempt((attempt) => attempt + 1);
      }, RECONNECT_DELAY_MS);
    });

    socket.addEventListener("error", () => {
      if (!disposed) setConnectionStatus("reconnecting");
    });

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      if (socketRef.current === socket) socketRef.current = null;
      socket.close(1000, "Lobby connection replaced.");
    };
  }, [reconnectAttempt, reconnectToken, sessionCode]);

  const acceptRoom = useCallback((payload: {
    session: RoomSession;
    room: PublicRoomState;
  }) => {
    shouldReconnectRef.current = true;
    saveRoomSession(payload.session);
    setReconnectAttempt(0);
    setConnectionStatus("connecting");
    setSession(payload.session);
    setRoom(payload.room);
    setStatus("ready");
    setError(null);
  }, []);

  const createRoom = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      acceptRoom(await requestCreateRoom(profile));
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Could not create a room.");
    }
  }, [acceptRoom, profile]);

  const joinRoom = useCallback(async (code: string) => {
    setStatus("loading");
    setError(null);
    try {
      acceptRoom(await requestJoinRoom(profile, code));
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Could not join the room.");
    }
  }, [acceptRoom, profile]);

  const leaveRoom = useCallback(async () => {
    shouldReconnectRef.current = false;
    socketRef.current?.close(1000, "Left the room.");
    setConnectionStatus("disconnected");
    if (session) {
      try {
        await requestLeaveRoom(session);
      } catch {
        // Always forget the local session, even if the room has expired.
      }
    }
    clearRoomSession();
    setSession(null);
    setRoom(null);
    setStatus("idle");
    setError(null);
  }, [session]);

  return {
    session,
    room,
    status,
    connectionStatus,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
