export const PROFILE_VERSION = 1 as const;
export const PROFILE_STORAGE_KEY = "typeblade.profile.v1";
export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 20;

export interface LocalProfile {
  version: typeof PROFILE_VERSION;
  id: string;
  username: string;
  createdAt: number;
  updatedAt: number;
}

export type ProfileMutationResult =
  | { ok: true }
  | { ok: false; error: string };
