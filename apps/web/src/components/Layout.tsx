import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo, Wordmark } from '../card/pixel';
import { useSession } from '../session';

export function Layout() {
  const { me, logout } = useSession();
  const navigate = useNavigate();
  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Pixpedia, accueil">
          <Logo size={22} />
          <Wordmark fs={14} />
        </Link>
        {me && (
          <nav className="nav" aria-label="Navigation principale">
            <NavLink to="/" end>
              Packs
            </NavLink>
            <NavLink to="/codex">Codex</NavLink>
            <NavLink to="/sets">Sets</NavLink>
            <NavLink to="/reglages">Réglages</NavLink>
          </nav>
        )}
        <div className="account">
          {me ? (
            <>
              <span className="px-label packs-pill" title="Packs disponibles">
                {me.packsAvailable}/{me.packsMax}
              </span>
              <span className="px-label shards" title="Éclats">
                ◆ {me.shards}
              </span>
              <Link to="/reglages" className="username" title="Réglages">
                {me.username}
              </Link>
              <button
                type="button"
                className="btn-link"
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
              >
                Déconnexion
              </button>
            </>
          ) : me === null ? (
            <NavLink to="/connexion" className="btn-link">
              Connexion
            </NavLink>
          ) : null}
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
      <footer className="footer">
        Projet non officiel, sans lien avec les éditeurs. Données :{' '}
        <a href="https://www.igdb.com" target="_blank" rel="noreferrer">
          IGDB.com
        </a>
      </footer>
    </div>
  );
}
