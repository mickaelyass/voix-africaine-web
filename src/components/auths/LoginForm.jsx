import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');
  const { login, error: contextError, clearError } = useAuth();

  const error = localError || contextError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError?.();
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setLocalError(
        err?.message || 'Email ou mot de passe incorrect'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="alert-error" role="alert" aria-live="polite">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      <div>
        <label className="label" htmlFor="login-email">Adresse email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          className="input"
          required
          aria-required="true"
          aria-invalid={!!error}
          disabled={busy}
        />
      </div>
      <div>
        <label className="label" htmlFor="login-password">Mot de passe</label>
        <div className="relative">
          <input
            id="login-password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input pr-12"
            required
            aria-required="true"
            aria-invalid={!!error}
            disabled={busy}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-bold text-brand-600 hover:text-brand-700"
            aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {show ? 'Masquer' : 'Afficher'}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="btn-primary w-full !py-3"
        aria-busy={busy}
      >
        {busy ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Connexion en cours...
          </span>
        ) : 'Se connecter'}
      </button>
      <p className="text-center text-xs text-ink-700/50">Connexion securisee sur cet appareil.</p>
    </form>
  );
}
