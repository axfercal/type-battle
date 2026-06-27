import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type {
  LocalProfile,
  ProfileMutationResult,
} from "./profileTypes";
import { USERNAME_MAX_LENGTH } from "./profileTypes";

interface ProfileMenuProps {
  profile: LocalProfile;
  onSave: (username: string) => ProfileMutationResult;
  onClose: () => void;
}

export function ProfileMenu({ profile, onSave, onClose }: ProfileMenuProps) {
  const [username, setUsername] = useState(profile.username);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = onSave(username);
    if (result.ok) onClose();
    else setError(result.error);
  };

  return (
    <div className="profile-dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="profile-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close profile editor">×</button>
        <p className="eyebrow">Local profile</p>
        <h2 id="edit-profile-title">Edit battle name</h2>
        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="edit-profile-username">Username</label>
          <input
            id="edit-profile-username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              if (error) setError(null);
            }}
            maxLength={USERNAME_MAX_LENGTH * 2}
            autoComplete="nickname"
            autoFocus
            aria-invalid={Boolean(error)}
          />
          {error && <p className="profile-error" role="alert">{error}</p>}
          <button className="primary-btn" type="submit">Save name</button>
        </form>
      </section>
    </div>
  );
}
