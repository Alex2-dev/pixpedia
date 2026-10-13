import { useState } from 'react';
import { api, errorMessage } from '../api';
import { useSession } from '../session';

/** Réglages du profil, enregistrés côté serveur. */
export function Settings() {
  const { me, setMe } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  if (!me) return null;

  const toggle = async (reducedMotion: boolean) => {
    setPending(true);
    setError(null);
    try {
      await api('/me/settings', { method: 'PATCH', body: { reducedMotion } });
      setMe({ ...me, reducedMotion });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="panel form">
      <h1>Réglages</h1>
      <label className="check">
        <input
          type="checkbox"
          checked={me.reducedMotion}
          disabled={pending}
          onChange={(e) => void toggle(e.target.checked)}
          data-testid="setting-reduced"
        />
        Animations réduites
      </label>
      <p className="muted small">
        Pas de secousse, de flash ni de rotation : les révélations et les drops passent par un
        simple fondu. Activé automatiquement si ton appareil demande moins d’animations.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
