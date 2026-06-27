import type { RoomIdentityInput } from "../../shared/multiplayer/roomTypes";

const MAX_REQUEST_BYTES = 2_048;

function cleanUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const username = value.trim().replace(/\s+/g, " ");
  const length = Array.from(username).length;
  if (length < 2 || length > 20) return null;
  const hasControlCharacter = Array.from(username).some((character) => {
    const code = character.codePointAt(0) ?? 0;
    return code <= 31 || code === 127;
  });
  return hasControlCharacter ? null : username;
}

function cleanProfileId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const id = value.trim();
  return id.length >= 8 && id.length <= 80 ? id : null;
}

export async function readRoomIdentity(
  request: Request,
): Promise<RoomIdentityInput | null> {
  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) return null;

  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_BYTES) return null;
    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const profileId = cleanProfileId(body.profileId);
    const username = cleanUsername(body.username);
    return profileId && username ? { profileId, username } : null;
  } catch {
    return null;
  }
}

export function readBearerToken(request: Request): string | null {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}
