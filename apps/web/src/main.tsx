import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login, Register } from './pages/Auth';
import { CardDetail } from './pages/CardDetail';
import { Collection } from './pages/Collection';
import { DevAnimations } from './pages/DevAnimations';
import { Gallery } from './pages/Gallery';
import { SetDetail } from './pages/SetDetail';
import { Sets } from './pages/Sets';
import { Home } from './pages/Home';
import { OpenPack } from './pages/OpenPack';
import { SessionProvider, useSession } from './session';
import './styles.css';

/** Routes réservées aux joueurs connectés. */
function Private({ children }: { children: React.ReactElement }) {
  const { me } = useSession();
  if (me === undefined) return <p className="muted center">Chargement…</p>;
  return me ? children : <Navigate to="/connexion" replace />;
}

/** Remonte l'écran d'ouverture à chaque nouveau pack (nouvelle clé d'idempotence). */
function OpenPackRoute() {
  const location = useLocation();
  return <OpenPack key={location.key} />;
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    {/* En prod, le jeu vit sous /pixpedia/ (VITE_BASE) ; en dev, à la racine. */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <SessionProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="connexion" element={<Login />} />
            <Route path="inscription" element={<Register />} />
            <Route
              path="ouverture"
              element={
                <Private>
                  <OpenPackRoute />
                </Private>
              }
            />
            <Route
              path="codex"
              element={
                <Private>
                  <Collection />
                </Private>
              }
            />
            {/* Ancien nom, gardé pour les liens existants. */}
            <Route path="classeur" element={<Navigate to="/codex" replace />} />
            <Route path="carte/:id" element={<CardDetail />} />
            <Route path="sets" element={<Sets />} />
            <Route path="sets/:type/:key" element={<SetDetail />} />
            {import.meta.env.DEV && <Route path="galerie" element={<Gallery />} />}
            {import.meta.env.DEV && <Route path="dev/animations" element={<DevAnimations />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  </StrictMode>,
);
