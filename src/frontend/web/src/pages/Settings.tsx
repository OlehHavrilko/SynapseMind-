import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useAuthStore } from '@/stores/authStore';
import './Settings.css';

const UPDATE_PREFERENCES = gql`
  mutation UpdatePreferences($input: UpdatePreferencesInput!) {
    updatePreferences(input: input) {
      id
      learningStyle
      theme
      dailyTimeBudget
      language
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: input) {
      id
      name
      email
      profession
    }
  }
`;

export default function Settings() {
  const { user, logout } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [learningStyle, setLearningStyle] = useState('mixed');
  const [dailyTime, setDailyTime] = useState(30);
  const [saved, setSaved] = useState(false);

  const [updatePreferences] = useMutation(UPDATE_PREFERENCES);
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  const handleSavePreferences = async () => {
    await updatePreferences({
      variables: {
        input: { learningStyle, dailyTimeBudget: dailyTime },
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveProfile = async () => {
    await updateProfile({
      variables: {
        input: { name },
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-page">
      <h1>⚙️ Settings</h1>

      <section className="settings-section">
        <h2>Profile</h2>
        <div className="settings-card">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user?.email || ''} disabled />
          </div>
          <button onClick={handleSaveProfile} className="save-btn">
            Save Profile
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>Learning Preferences</h2>
        <div className="settings-card">
          <div className="form-group">
            <label>Learning Style</label>
            <select
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
            >
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="kinesthetic">Kinesthetic</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Daily Time Budget (minutes)</label>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={dailyTime}
              onChange={(e) => setDailyTime(Number(e.target.value))}
            />
            <span className="range-value">{dailyTime} min</span>
          </div>
          <button onClick={handleSavePreferences} className="save-btn">
            Save Preferences
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>Account</h2>
        <div className="settings-card">
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </section>

      {saved && <div className="save-toast">Saved successfully!</div>}
    </div>
  );
}
