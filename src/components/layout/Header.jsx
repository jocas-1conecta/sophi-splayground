import { useState } from 'react';
import { useProfileStore } from '../../stores/profileStore';
import SoundToggle from '../ui/SoundToggle';
import './Header.css';

export default function Header() {
  const { profile } = useProfileStore();
  const [copied, setCopied] = useState(false);

  async function handleShareCode() {
    if (!profile?.friend_code) return;

    const shareData = {
      title: "Sophi's Playground",
      text: `¡Agrégame en Sophi's Playground! Mi código de amiga es: ${profile.friend_code} 🎮✨`,
      url: 'https://sophi-splayground.pages.dev',
    };

    // Try Web Share API first (works on mobile PWA)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // user cancelled
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(
        `${shareData.text}\n${shareData.url}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last fallback
      prompt('Tu código de amiga:', profile.friend_code);
    }
  }

  return (
    <header className="header glass">
      <div className="header-inner container">
        <div className="header-brand">
          <span className="header-logo">🎮</span>
          <h1 className="header-title text-gradient">Sophi's</h1>
        </div>

        {profile && (
          <div className="header-stats">
            {/* Friend Code Button */}
            <button
              className={`header-friend-code ${copied ? 'copied' : ''}`}
              onClick={handleShareCode}
              title="Compartir código de amiga"
            >
              <span className="header-code-value">{profile.friend_code}</span>
              <span className="header-code-icon">{copied ? '✅' : '📋'}</span>
            </button>

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
