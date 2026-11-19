import { Page, expect, test } from '@playwright/test';
import { resetFixtures } from './support/designer-api';
import { ORDERS_GRID, PAGE, STATUS_FILTER, TOOLBAR, editItem } from './support/testids';

const SAVE_BUTTON = 'editing.actions.applyclose';

async function openOrdersPage(page: Page): Promise<void> {
  await page.goto('/?user=e2e-user');
  await expect(page.getByTestId(PAGE)).toBeVisible();
  await expect(page.getByTestId(ORDERS_GRID)).toBeVisible();
  await expect(page.locator('.dx-data-row')).toHaveCount(3);
}

function gridRow(page: Page, index: number) {
  return page.getByTestId(ORDERS_GRID).locator('.dx-data-row').nth(index);
}

test.describe('orders list page', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetFixtures(request);
  });

  test('renders page, toolbar and grid rows with lookup display values', async ({ page }) => {
    await openOrdersPage(page);

    await expect(page.getByTestId(TOOLBAR)).toBeVisible();
    await expect(page.getByTestId(STATUS_FILTER)).toBeVisible();

    await expect(gridRow(page, 0)).toContainText('O-1001');
    await expect(gridRow(page, 0)).toContainText('Acme GmbH');
    await expect(gridRow(page, 0)).toContainText('Open');
    await expect(gridRow(page, 2)).toContainText('Closed');
  });

  test('edit dialog opens with test-ids and save persists change', async ({ page }) => {
    await openOrdersPage(page);

    await gridRow(page, 0).locator('.dx-command-edit a[title="Edit"]').click();

    const orderNr = page.getByTestId(editItem('OrderNr', 0));
    await expect(orderNr).toBeVisible();
    await expect(page.getByTestId(editItem('Customer', 1))).toBeVisible();
    await expect(page.getByTestId(editItem('Status', 2))).toBeVisible();

    await orderNr.locator('input').fill('O-1001 EDITED');
    await page.getByRole('button', { name: SAVE_BUTTON }).click();

    await expect(gridRow(page, 0)).toContainText('O-1001 EDITED');

    await page.reload();
    await expect(page.getByTestId(ORDERS_GRID)).toBeVisible();
    await expect(gridRow(page, 0)).toContainText('O-1001 EDITED');
  });

  test('cancel closes edit dialog without persisting', async ({ page }) => {
    await openOrdersPage(page);

    await gridRow(page, 0).locator('.dx-command-edit a[title="Edit"]').click();
    await page.getByTestId(editItem('OrderNr', 0)).locator('input').fill('SHOULD NOT PERSIST');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(gridRow(page, 0)).toContainText('O-1001');
    await expect(gridRow(page, 0)).not.toContainText('SHOULD NOT PERSIST');
  });

  test('add action creates new item', async ({ page }) => {
    await openOrdersPage(page);

    await page.getByRole('button', { name: 'Add Demo order' }).click();
    await page.getByTestId(editItem('OrderNr', 0)).locator('input').fill('O-9999 NEW');
    await page.getByTestId(editItem('Customer', 1)).locator('input').fill('NewCustomer');
    await page.getByRole('button', { name: SAVE_BUTTON }).click();

    await expect(page.locator('.dx-data-row')).toHaveCount(4);
    await expect(page.locator('.dx-data-row', { hasText: 'O-9999' })).toContainText('NewCustomer');
  });

  test('remove action deletes item after confirmation', async ({ page }) => {
    await openOrdersPage(page);

    await gridRow(page, 0).locator('.dx-command-edit a[title="Remove"]').click();
    await page.getByRole('button', { name: 'Remove', exact: true }).click();

    await expect(page.locator('.dx-data-row')).toHaveCount(2);
    await expect(gridRow(page, 0)).toContainText('O-1002');
  });

  test('status filter triggers head param query and filters grid', async ({ page }) => {
    await openOrdersPage(page);

    await page.getByTestId(STATUS_FILTER).click();

    const queryResponse = page.waitForResponse((response) =>
      /\/generic\/ballware\/demoorder\/query/.test(response.url()) && response.url().includes('statusfilter=closed'));

    await page.locator('.dx-list-item').filter({ hasText: 'Closed' }).first().click();

    const response = await queryResponse;
    expect(response.ok()).toBeTruthy();

    await expect(page.locator('.dx-data-row')).toHaveCount(1);
    await expect(page.locator('.dx-data-row')).toContainText('O-1003');
  });

  test('user without rights cannot access page', async ({ page }) => {
    await page.goto('/?user=e2e-user-no-rights');

    await expect(page.getByTestId(ORDERS_GRID)).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Demo order' })).not.toBeVisible();
  });
});
