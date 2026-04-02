import { useProfileStore } from '../../stores/profileStore';
import SoundToggle from '../ui/SoundToggle';
import './Header.css';

export default function Header() {
  const { profile } = useProfileStore();

  return (
    <header className="header glass">
      <div className="header-inner container">
        <div className="header-brand">
          <span className="header-logo">🎮</span>
          <h1 className="header-title text-gradient">Sophi's</h1>
        </div>

        {profile && (
          <div className="header-stats">
            <SoundToggle />
            <div className="header-points" title="Tus puntos">
              <span className="header-points-icon">💎</span>
              <span className="header-points-value">{profile.points}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
