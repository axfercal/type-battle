import { useCallback, useEffect, useState } from "react";
import type { LocalProfile } from "../profile/profileTypes";
import type {
  PublicRoomState,
  RoomSession,
} from "../../../shared/multiplayer/roomTypes";
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

export function useRoom(profile: LocalProfile) {
  const [initialSession] = useState(loadRoomSession);
  const [session, setSession] = useState<RoomSession | null>(initialSession);
  const [room, setRoom] = useState<PublicRoomState | null>(null);
  const [status, setStatus] = useState<RoomStatus>(
    initialSession ? "loading" : "idle",
  );
  const [error, setError] = useState<string | null>(null);

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
          clearRoomSession();
          setSession(null);
          setRoom(null);
        }
        setStatus("error");
        setError(cause instanceof Error ? cause.message : "Could not restore the room.");
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const acceptRoom = useCallback((payload: {
    session: RoomSession;
    room: PublicRoomState;
  }) => {
    saveRoomSession(payload.session);
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

  const refreshRoom = useCallback(async () => {
    if (!session) return;
    setStatus("loading");
    setError(null);
    try {
      const payload = await requestRoom(session);
      if (payload.seat !== session.seat) {
        const nextSession = { ...session, seat: payload.seat };
        saveRoomSession(nextSession);
        setSession(nextSession);
      }
      setRoom(payload.room);
      setStatus("ready");
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Could not refresh the room.");
    }
  }, [session]);

  const leaveRoom = useCallback(async () => {
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
    error,
    createRoom,
    joinRoom,
    refreshRoom,
    leaveRoom,
  };
}
