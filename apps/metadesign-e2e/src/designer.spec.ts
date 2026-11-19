import { expect, test } from '@playwright/test';
import { getOverlay, getRevision, listOverlays, resetFixtures, setOverlay } from './support/designer-api';
import { ORDERS_GRID } from './support/testids';

test.describe('designer fixture middleware', () => {
  test('reset increments revision and restores seed data', async ({ request }) => {
    const before = await getRevision(request);
    const after = await resetFixtures(request);

    expect(after.revision).not.toBe(before.revision);
  });

  test('overlay round-trip changes compiled grid metadata and resets cleanly', async ({ page, request }) => {
    await resetFixtures(request);

    await page.goto('/?user=e2e-user');
    await expect(page.getByTestId(ORDERS_GRID)).toBeVisible();
    await expect(page.locator('.dx-datagrid-headers')).toContainText('Order no');

    await setOverlay(request, 'entity', 'demoorder', {
      GridLayout: { '0': { columns: { '0': { caption: 'Changed name' } } } },
    });

    const overlay = await getOverlay(request, 'entity', 'demoorder');
    expect(overlay).not.toBeNull();
    expect(JSON.stringify(overlay)).toContain('Changed name');

    const overlays = await listOverlays(request, 'entity');
    expect(overlays.some((o) => o.id === 'demoorder')).toBeTruthy();

    await page.reload();
    await expect(page.getByTestId(ORDERS_GRID)).toBeVisible();
    await expect(page.locator('.dx-datagrid-headers')).toContainText('Changed name');

    await resetFixtures(request);
    await page.reload();
    await expect(page.getByTestId(ORDERS_GRID)).toBeVisible();
    await expect(page.locator('.dx-datagrid-headers')).toContainText('Order no');
  });

  test('bootstrap serves tenant user selection payload', async ({ request }) => {
    const response = await request.get('/designer/bootstrap?tenant=e2e&user=e2e-user');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.tenant).toBeTruthy();
    expect(body.user).toBeTruthy();
  });
});
