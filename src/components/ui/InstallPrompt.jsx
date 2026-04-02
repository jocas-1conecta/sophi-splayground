import { useState, useEffect } from 'react';
import './InstallPrompt.css';

const DISMISS_KEY = 'sophis_install_dismissed';
const DISMISS_DAYS = 7;

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = new Date(dismissed).getTime();
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Small delay to not interrupt initial load
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
  };

  if (!show) return null;

  return (
    <div className="install-prompt animate-fade-in-up">
      <div className="install-prompt-content">
        <div className="install-prompt-icon">📲</div>
        <div className="install-prompt-text">
          <strong>¡Instala Sophi's!</strong>
          <span>Juega desde tu pantalla de inicio</span>
        </div>
      </div>
      <div className="install-prompt-actions">
        <button className="btn btn-primary install-prompt-btn" onClick={handleInstall}>
          Instalar
        </button>
        <button className="install-prompt-dismiss" onClick={handleDismiss}>
          Ahora no
        </button>
      </div>
    </div>
  );
}
