import { RARITIES, RARITY_KEYS } from '@pixpedia/shared';

export function App() {
  return (
    <main className="page">
      <section className="panel" aria-labelledby="title">
        <p className="label">Alex² présente</p>
        <h1 id="title">Pixpedia</h1>
        <p className="soon">Bientôt</p>
        <p className="tagline">Collectionne tous les jeux vidéo jamais sortis.</p>
        <ul className="rarities" aria-label="Raretés des cartes">
          {RARITY_KEYS.map((key) => (
            <li key={key} className={`rarity rarity-${key}`} title={RARITIES[key].label}>
              <span
                className="chip"
                style={RARITIES[key].color ? { background: RARITIES[key].color } : undefined}
              />
              <span className="label">{RARITIES[key].label}</span>
            </li>
          ))}
        </ul>
      </section>
      <footer className="footer">
        Projet non officiel, sans lien avec les éditeurs. Données :{' '}
        <a href="https://www.igdb.com" target="_blank" rel="noreferrer">
          IGDB.com
        </a>
      </footer>
    </main>
  );
}
