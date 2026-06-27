import { useCallback, useEffect, useState } from "react";
import {
  PROFILE_STORAGE_KEY,
  PROFILE_VERSION,
} from "./profileTypes";
import type {
  LocalProfile,
  ProfileMutationResult,
} from "./profileTypes";
import {
  loadProfile,
  parseStoredProfile,
  saveProfile,
  validateUsername,
} from "./profileStorage";

const STORAGE_ERROR = "Your browser could not save the profile. Check that local storage is available.";

export function useProfile() {
  const [profile, setProfile] = useState<LocalProfile | null>(loadProfile);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === PROFILE_STORAGE_KEY || event.key === null) {
        setProfile(parseStoredProfile(event.newValue));
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const createProfile = useCallback((value: string): ProfileMutationResult => {
    const result = validateUsername(value);
    if (!result.ok) return result;

    const now = Date.now();
    const nextProfile: LocalProfile = {
      version: PROFILE_VERSION,
      id: crypto.randomUUID(),
      username: result.username,
      createdAt: now,
      updatedAt: now,
    };

    try {
      saveProfile(nextProfile);
      setProfile(nextProfile);
      return { ok: true };
    } catch {
      return { ok: false, error: STORAGE_ERROR };
    }
  }, []);

  const updateUsername = useCallback((value: string): ProfileMutationResult => {
    const result = validateUsername(value);
    if (!result.ok) return result;

    if (!profile) {
      return { ok: false, error: "Create a profile before editing it." };
    }

    const nextProfile: LocalProfile = {
      ...profile,
      username: result.username,
      updatedAt: Date.now(),
    };

    try {
      saveProfile(nextProfile);
      setProfile(nextProfile);
      return { ok: true };
    } catch {
      return { ok: false, error: STORAGE_ERROR };
    }
  }, [profile]);

  return { profile, createProfile, updateUsername };
}
