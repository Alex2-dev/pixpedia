import { expect, test, type Page } from '@playwright/test';

const CAPTURES = 'captures';
const FINISHES = [
  { id: 'holo', step: 'finish-holo', durationMs: 1700, mid: 1000 },
  { id: 'fullart', step: 'finish-fullart', durationMs: 3000, mid: 1200 },
  { id: 'arena', step: 'finish-arena', durationMs: 2100, mid: 1500 },
] as const;
const CHAINS = [
  { id: 'boss-holo', drop: 'drop-boss', finish: 'finish-holo' },
  { id: 'final-arena', drop: 'drop-final', finish: 'finish-arena' },
  { id: 'hof-fullart', drop: 'drop-hof', finish: 'finish-fullart' },
] as const;

const stage = (page: Page) => page.getByTestId('drop-stage');

test.beforeEach(async ({ page }) => {
  await page.goto('/dev/animations');
  await expect(page.getByRole('heading', { name: 'Animations' })).toBeVisible();
});

for (const { id, step, durationMs, mid } of FINISHES) {
  test(`finition ${id} : se termine, et un clic la saute`, async ({ page }) => {
    await page.getByTestId(`play-${id}`).click();
    await expect(stage(page)).toHaveAttribute('data-step', step);
    await page.waitForTimeout(mid);
    await page.screenshot({ path: `${CAPTURES}/finish-${id}-mid.png` });
    await expect(stage(page)).toHaveAttribute('data-state', 'final', {
      timeout: durationMs + 2000,
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${CAPTURES}/finish-${id}-final.png` });

    await page.getByRole('button', { name: 'Rejouer' }).click();
    await expect(stage(page)).toHaveAttribute('data-state', 'playing');
    await stage(page).click({ position: { x: 195, y: 120 } });
    await expect(stage(page)).toHaveAttribute('data-state', 'final', { timeout: 300 });
    await page.getByRole('button', { name: 'Fermer' }).click();
    await expect(stage(page)).toHaveCount(0);
  });
}

for (const { id, drop, finish } of CHAINS) {
  test(`enchaînement ${id} : le drop puis la finition, recto déjà visible`, async ({ page }) => {
    await page.getByTestId(`play-${id}`).click();
    await expect(stage(page)).toHaveAttribute('data-step', drop);
    // Pas de bouton tant que la chaîne n'est pas à sa dernière étape.
    await expect(page.getByRole('button', { name: 'Fermer' })).toHaveCount(0);
    // Fin naturelle du drop : la finition s'enchaîne d'elle-même.
    await expect(stage(page)).toHaveAttribute('data-step', finish, { timeout: 6000 });
    await expect(stage(page)).toHaveAttribute('data-after', 'true');
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${CAPTURES}/chain-${id}.png` });
    await expect(stage(page)).toHaveAttribute('data-state', 'final', { timeout: 4000 });

    // Rejouer repart du drop ; un toucher passe à la finition, un autre la saute.
    await page.getByRole('button', { name: 'Rejouer' }).click();
    await expect(stage(page)).toHaveAttribute('data-step', drop);
    await stage(page).click({ position: { x: 195, y: 120 } });
    await expect(stage(page)).toHaveAttribute('data-step', finish);
    await stage(page).click({ position: { x: 195, y: 120 } });
    await expect(stage(page)).toHaveAttribute('data-state', 'final', { timeout: 300 });
    await page.getByRole('button', { name: 'Fermer' }).click();
    await expect(stage(page)).toHaveCount(0);
  });
}

test('animations réduites : une chaîne va droit à la finition, à l’état final', async ({
  page,
}) => {
  await page.getByTestId('toggle-reduced').check();
  await page.getByTestId('play-hof-fullart').click();
  await expect(stage(page)).toHaveAttribute('data-step', 'finish-fullart');
  await expect(stage(page)).toHaveAttribute('data-state', 'final');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${CAPTURES}/finish-reduced.png` });
});
