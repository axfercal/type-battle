import { useState } from "react";
import { BattlePanel } from "../components/BattlePanel";
import { ProfileMenu } from "../features/profile/ProfileMenu";
import { ProfileSetup } from "../features/profile/ProfileSetup";
import { useProfile } from "../features/profile/useProfile";
import "./styles.css";

function App() {
  const { profile, createProfile, updateUsername } = useProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  if (!profile) {
    return (
      <div className="app app--onboarding">
        <header className="site-header">
          <div className="brand-mark" aria-hidden="true"><span>T</span></div>
          <div>
            <h1 className="app-title">Typeblade</h1>
            <p className="app-subtitle">Words are your weapon</p>
          </div>
        </header>
        <ProfileSetup onCreate={createProfile} />
        <footer>One local profile. No account required.</footer>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="brand-mark" aria-hidden="true"><span>T</span></div>
        <div>
          <h1 className="app-title">Typeblade</h1>
          <p className="app-subtitle">Words are your weapon</p>
        </div>
        <button className="profile-chip" type="button" onClick={() => setIsEditingProfile(true)} aria-label={`Edit profile for ${profile.username}`}>
          <span aria-hidden="true">{Array.from(profile.username)[0]?.toUpperCase()}</span>
          <strong>{profile.username}</strong>
        </button>
      </header>
      <BattlePanel />
      <footer>Built for quick battles. Your profile stays in this browser.</footer>
      {isEditingProfile && (
        <ProfileMenu
          profile={profile}
          onSave={updateUsername}
          onClose={() => setIsEditingProfile(false)}
        />
      )}
    </div>
  );
}

export default App;
