import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api';
import { useSession } from '../session';

const COUNTRIES: [string, string][] = [
  ['FR', 'France'],
  ['BE', 'Belgique'],
  ['CH', 'Suisse'],
  ['LU', 'Luxembourg'],
  ['MC', 'Monaco'],
  ['CA', 'Canada'],
  ['DE', 'Allemagne'],
  ['ES', 'Espagne'],
  ['IT', 'Italie'],
  ['PT', 'Portugal'],
  ['GB', 'Royaume-Uni'],
  ['US', 'États-Unis'],
  ['MA', 'Maroc'],
  ['DZ', 'Algérie'],
  ['TN', 'Tunisie'],
  ['SN', 'Sénégal'],
  ['CI', 'Côte d’Ivoire'],
];

function useSubmit(action: () => Promise<void>) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };
  return { error, pending, submit };
}

export function Login() {
  const { refresh } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { error, pending, submit } = useSubmit(async () => {
    await api('/auth/login', { method: 'POST', body: { email, password } });
    await refresh();
    navigate('/');
  });
  return (
    <form className="panel form" onSubmit={submit}>
      <h1>Connexion</h1>
      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Mot de passe
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
      <p className="muted small">
        Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
      </p>
    </form>
  );
}

export function Register() {
  const { refresh } = useSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    countryCode: 'FR',
    ageConfirmed: false,
  });
  const set = (k: keyof typeof form) => (e: { target: HTMLInputElement | HTMLSelectElement }) =>
    setForm((f) => ({
      ...f,
      [k]:
        e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value,
    }));
  const { error, pending, submit } = useSubmit(async () => {
    await api('/auth/register', { method: 'POST', body: form });
    await refresh();
    navigate('/');
  });
  return (
    <form className="panel form" onSubmit={submit}>
      <h1>Créer un compte</h1>
      <label>
        Pseudo
        <input
          autoComplete="username"
          required
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9_\-]{3,20}"
          title="3 à 20 caractères : lettres, chiffres, _ et -"
          value={form.username}
          onChange={set('username')}
        />
      </label>
      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={set('email')}
        />
      </label>
      <label>
        Mot de passe <span className="muted small">(10 caractères minimum)</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          value={form.password}
          onChange={set('password')}
        />
      </label>
      <label>
        Pays
        <select value={form.countryCode} onChange={set('countryCode')}>
          {COUNTRIES.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className="check">
        <input
          type="checkbox"
          required
          checked={form.ageConfirmed}
          onChange={set('ageConfirmed')}
        />
        J’ai 15 ans ou plus
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'Création…' : 'Créer mon compte'}
      </button>
      <p className="muted small">
        Déjà un compte ? <Link to="/connexion">Se connecter</Link>
      </p>
    </form>
  );
}
