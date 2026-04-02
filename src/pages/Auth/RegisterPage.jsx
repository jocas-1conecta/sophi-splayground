import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROUTES } from '../../constants/routes';
import './Auth.css';

export default function RegisterPage() {
  const { signUp, isLoading, error, clearError } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden 🤔');
      return;
    }

    if (displayName.trim().length < 2) {
      setLocalError('Tu nombre debe tener al menos 2 letras');
      return;
    }

    await signUp(email, password, displayName.trim());
  }

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up">
        <div className="auth-header">
          <span className="auth-logo">🎉</span>
          <h1 className="auth-title text-gradient">¡Únete!</h1>
          <p className="auth-subtitle">Crea tu cuenta y empieza a jugar</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="register-name">
              ¿Cómo te llamas? 💫
            </label>
            <input
              id="register-name"
              className="input"
              type="text"
              placeholder="Tu nombre o apodo"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={2}
              maxLength={30}
              autoComplete="name"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-email">
              Correo electrónico
            </label>
            <input
              id="register-email"
              className="input"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-password">
              Contraseña
            </label>
            <input
              id="register-password"
              className="input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-confirm">
              Confirmar contraseña
            </label>
            <input
              id="register-confirm"
              className="input"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {displayError && (
            <div className="auth-error animate-shake">
              <span>❌</span> {displayError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-secondary btn-full btn-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="animate-spin">⏳</span> Creando cuenta...
              </span>
            ) : (
              '¡Crear mi cuenta! 🚀'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link to={ROUTES.LOGIN} className="auth-link">
              ¡Entra aquí! ✨
            </Link>
          </p>
        </div>
      </div>

      {/* Floating decorations */}
      <div className="auth-decoration auth-deco-1">🌟</div>
      <div className="auth-decoration auth-deco-2">🦋</div>
      <div className="auth-decoration auth-deco-3">💜</div>
    </div>
  );
}
