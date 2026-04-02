import { useState } from 'react';
import { isMuted, toggleMute } from '../../lib/audioManager';

export default function SoundToggle() {
  const [muted, setMuted] = useState(isMuted());

  const handleToggle = () => {
    const newState = toggleMute();
    setMuted(newState);
  };

  return (
    <button
      className="sound-toggle"
      onClick={handleToggle}
      title={muted ? 'Activar sonido' : 'Silenciar'}
      aria-label={muted ? 'Activar sonido' : 'Silenciar'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
