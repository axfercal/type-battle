import { useState } from "react";
import type { FormEvent } from "react";
import type { ProfileMutationResult } from "./profileTypes";
import { USERNAME_MAX_LENGTH } from "./profileTypes";

interface ProfileSetupProps {
  onCreate: (username: string) => ProfileMutationResult;
}

export function ProfileSetup({ onCreate }: ProfileSetupProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = onCreate(username);
    if (!result.ok) setError(result.error);
  };

  return (
    <main className="profile-setup">
      <section className="start-card profile-card" aria-labelledby="profile-title">
        <div className="crest" aria-hidden="true">♞</div>
        <p className="eyebrow">Welcome to Typeblade</p>
        <h2 id="profile-title">Choose your battle name.</h2>
        <p className="start-copy">
          This is how rivals will know you. You can change it whenever you like.
        </p>

        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="profile-username">Username</label>
          <input
            id="profile-username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              if (error) setError(null);
            }}
            maxLength={USERNAME_MAX_LENGTH * 2}
            autoComplete="nickname"
            autoFocus
            placeholder="e.g. ShadowFox"
            aria-describedby={error ? "profile-error profile-privacy" : "profile-privacy"}
            aria-invalid={Boolean(error)}
          />
          {error && <p className="profile-error" id="profile-error" role="alert">{error}</p>}
          <button className="primary-btn" type="submit">Create profile</button>
        </form>

        <p className="profile-privacy" id="profile-privacy">
          Your profile stays in this browser. No account or email required.
        </p>
      </section>
    </main>
  );
}
