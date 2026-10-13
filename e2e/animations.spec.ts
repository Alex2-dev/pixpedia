import { expect, test, type Page } from '@playwright/test';

const CAPTURES = 'captures';
const DROPS = [
  { rarity: 'boss', durationMs: 1400 },
  { rarity: 'final', durationMs: 3000 },
  { rarity: 'hof', durationMs: 4500 },
] as const;

const stage = (page: Page) => page.getByTestId('drop-stage');

test.beforeEach(async ({ page }) => {
  await page.goto('/dev/animations');
  await expect(page.getByRole('heading', { name: 'Animations' })).toBeVisible();
});

for (const { rarity, durationMs } of DROPS) {
  test(`drop ${rarity} : se termine, et un clic le saute`, async ({ page }) => {
    await page.getByTestId(`play-${rarity}`).click();
    await expect(stage(page)).toHaveAttribute('data-state', 'playing');
    await expect(stage(page)).toHaveAttribute('data-state', 'final', {
      timeout: durationMs + 2000,
    });
    // Laisse les dernières entrées (bouton, bandeau) se poser avant la capture.
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${CAPTURES}/drop-${rarity}-final.png` });

    // Rejouer, puis sauter tout de suite.
    await page.getByRole('button', { name: 'Rejouer' }).click();
    await expect(stage(page)).toHaveAttribute('data-state', 'playing');
    await stage(page).click({ position: { x: 195, y: 120 } });
    await expect(stage(page)).toHaveAttribute('data-state', 'final', { timeout: 300 });
    await page.getByRole('button', { name: 'Fermer' }).click();
    await expect(stage(page)).toHaveCount(0);
  });
}

test('premier Hall of Fame : le saut est bloqué 1,5 s', async ({ page }) => {
  await page.getByLabel('Premier Hall of Fame (saut bloqué 1,5 s)').check();
  await page.getByTestId('play-hof').click();
  await page.waitForTimeout(400);
  await stage(page).click({ position: { x: 195, y: 120 } });
  await page.waitForTimeout(150);
  await expect(stage(page)).toHaveAttribute('data-state', 'playing');
  await page.waitForTimeout(1100);
  await stage(page).click({ position: { x: 195, y: 120 } });
  await expect(stage(page)).toHaveAttribute('data-state', 'final', { timeout: 300 });
});

test('animations réduites : état final immédiat, sans secousse', async ({ page }) => {
  await page.getByTestId('toggle-reduced').check();
  await page.getByTestId('play-final').click();
  await expect(stage(page)).toHaveAttribute('data-state', 'final');
  await expect(stage(page)).toHaveClass(/dp-reduced/);
  const shake = await page.locator('.ff-shake').evaluate((e) => getComputedStyle(e).animationName);
  expect(shake).toBe('none');
});

/** Déroule une ouverture carte par carte jusqu'au récap, en traversant les drops. */
async function playThrough(page: Page, expectedCards: number) {
  const opening = page.getByTestId('pack-opening');
  await page.getByTestId('tear').click();
  await expect(page.getByTestId('reveal-down').locator('.op-card')).toBeVisible({ timeout: 6000 });
  const seen: string[] = [];
  for (
    let i = 0;
    i < expectedCards * 3 && (await opening.getAttribute('data-phase')) !== 'recap';
    i++
  ) {
    if (await stage(page).count()) {
      seen.push(`drop:${await stage(page).locator('.pxcard').getAttribute('data-rarity')}`);
      await stage(page).click({ position: { x: 195, y: 120 } });
      await page.getByRole('button', { name: 'AJOUTER AU CODEX' }).click();
      continue;
    }
    // Les cartes « respirent » ou flottent en boucle : Playwright attendrait indéfiniment qu'elles
    // soient immobiles. Le clic est donc forcé (un joueur, lui, peut toucher une carte qui bouge).
    const down = page.getByTestId('reveal-down').locator('.op-card');
    if (await down.count()) {
      await down.click({ force: true });
      continue;
    }
    const up = page.getByTestId('reveal-up');
    if (await up.count()) {
      // Après un drop, la carte déjà comptée revient retournée : on ne la compte pas deux fois.
      const rarity = String(await up.getAttribute('data-rarity'));
      if (seen.at(-1) !== `drop:${rarity}`) seen.push(rarity);
      else seen.push('');
      await up.locator('.op-card').click({ force: true });
    }
  }
  await expect(opening).toHaveAttribute('data-phase', 'recap');
  const cards = seen.filter(Boolean);
  expect(cards).toHaveLength(expectedCards);
  return cards;
}

test('ouverture d’1 pack jusqu’au récap, la plus rare en dernier', async ({ page }) => {
  await page.getByTestId('open-1').click();
  await expect(page.getByText('1 PACK À OUVRIR')).toBeVisible();
  const seen = await playThrough(page, 5);
  expect(seen).toEqual(['starter', 'bonus', 'combo', 'drop:boss', 'drop:final']);
  await expect(page.getByTestId('recap')).toContainText('BOSS FINAL');
  await page.screenshot({ path: `${CAPTURES}/opening-1-recap.png` });
});

test('ouverture de 7 packs jusqu’au récap', async ({ page }) => {
  await page.getByTestId('open-7').click();
  await expect(page.getByText('7 PACKS À OUVRIR')).toBeVisible();
  await expect(page.locator('.op-badge')).toHaveText('×7');
  const seen = await playThrough(page, 35);
  expect(seen.filter((s) => s.startsWith('drop:'))).toEqual([
    'drop:boss',
    'drop:final',
    'drop:hof',
  ]);
  await expect(page.getByTestId('recap')).toContainText('cartes communes');
  await page.screenshot({ path: `${CAPTURES}/opening-7-recap.png` });
});

test('« Tout révéler » mène directement au récap', async ({ page }) => {
  await page.getByTestId('open-7').click();
  await page.getByTestId('tear').click();
  await expect(page.getByTestId('reveal-down').locator('.op-card')).toBeVisible({ timeout: 6000 });
  await expect(page.getByTestId('left-line')).toHaveText('ENCORE 34 CARTES');
  await page.getByTestId('reveal-all').click();
  await expect(page.getByTestId('pack-opening')).toHaveAttribute('data-phase', 'recap');
});
