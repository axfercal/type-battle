import {
  PROFILE_STORAGE_KEY,
  PROFILE_VERSION,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "./profileTypes";
import type { LocalProfile } from "./profileTypes";

function containsControlCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.codePointAt(0) ?? 0;
    return code <= 31 || code === 127;
  });
}

export function validateUsername(value: string):
  | { ok: true; username: string }
  | { ok: false; error: string } {
  const username = value.trim().replace(/\s+/g, " ");
  const length = Array.from(username).length;

  if (length < USERNAME_MIN_LENGTH) {
    return { ok: false, error: `Use at least ${USERNAME_MIN_LENGTH} characters.` };
  }

  if (length > USERNAME_MAX_LENGTH) {
    return { ok: false, error: `Use no more than ${USERNAME_MAX_LENGTH} characters.` };
  }

  if (containsControlCharacters(username)) {
    return { ok: false, error: "That name contains unsupported characters." };
  }

  return { ok: true, username };
}

export function parseStoredProfile(value: string | null): LocalProfile | null {
  if (!value) return null;

  try {
    const candidate = JSON.parse(value) as Partial<LocalProfile>;
    const validatedName = validateUsername(
      typeof candidate.username === "string" ? candidate.username : "",
    );

    if (
      candidate.version !== PROFILE_VERSION ||
      typeof candidate.id !== "string" ||
      candidate.id.length === 0 ||
      typeof candidate.createdAt !== "number" ||
      typeof candidate.updatedAt !== "number" ||
      !validatedName.ok
    ) {
      return null;
    }

    return {
      version: PROFILE_VERSION,
      id: candidate.id,
      username: validatedName.username,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    };
  } catch {
    return null;
  }
}

export function loadProfile(): LocalProfile | null {
  try {
    return parseStoredProfile(localStorage.getItem(PROFILE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveProfile(profile: LocalProfile): void {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
