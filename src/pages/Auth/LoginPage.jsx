import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROUTES } from '../../constants/routes';
import './Auth.css';

export default function LoginPage() {
  const { signIn, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();
    await signIn(email, password);
  }

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up">
        <div className="auth-header">
          <span className="auth-logo">🎮</span>
          <h1 className="auth-title text-gradient">¡Bienvenida!</h1>
          <p className="auth-subtitle">Entra a jugar con tus amigas</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="login-email">
              Correo electrónico
            </label>
            <input
              id="login-email"
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
            <label className="input-label" htmlFor="login-password">
              Contraseña
            </label>
            <input
              id="login-password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="auth-error animate-shake">
              <span>❌</span> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="animate-spin">⏳</span> Entrando...
              </span>
            ) : (
              '¡Entrar! ✨'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tienes cuenta?{' '}
            <Link to={ROUTES.REGISTER} className="auth-link">
              ¡Regístrate aquí! 🌟
            </Link>
          </p>
        </div>
      </div>

      {/* Floating decorations */}
      <div className="auth-decoration auth-deco-1">✨</div>
      <div className="auth-decoration auth-deco-2">🌸</div>
      <div className="auth-decoration auth-deco-3">⭐</div>
    </div>
  );
}
