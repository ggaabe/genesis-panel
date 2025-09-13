import { test, expect } from '@playwright/test';

test.describe('Genesis Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Start Mission flow transitions queued -> running -> terminal', async ({ page }) => {
    await page.clock.install();
    // Open create modal
    await page.getByTestId('btn-create-mission').click();
    await page.getByTestId('input-mission-name').fill('E2E Mission');
    // Source defaults to S3; no need to change it
    await page.getByTestId('input-mission-goal').fill('Test goal');
    await page.getByTestId('btn-submit-mission').click();

    // There should be a new mission row; find it by name and capture id from data attribute
    const row = page.locator('[data-testid^="mission-row-"]').filter({ hasText: 'E2E Mission' }).first();
    await expect(row).toBeVisible();
    const missionId = await row.getAttribute('data-mission-id');
    expect(missionId).toBeTruthy();

    // Initially queued
    await expect(page.getByTestId(`mission-status-${missionId}`)).toContainText(/queued/i);

    // Advance 11s -> running
    await page.clock.fastForward(11_000);
    await expect(page.getByTestId(`mission-status-${missionId}`)).toContainText(/running/i);
    // startedAt now visible; duration ticking
    await expect(page.getByTestId(`mission-started-${missionId}`)).not.toHaveText('-');

    // Advance to 16s total -> terminal (succeeded/failed)
    await page.clock.fastForward(5_000);
    const statusCell = page.getByTestId(`mission-status-${missionId}`);
    await expect(statusCell).toHaveText(/succeeded|failed|canceled/i);
    // Duration stays formatted mm:ss
    const durText = await page.getByTestId(`mission-duration-${missionId}`).innerText();
    expect(/\d{2}:\d{2}/.test(durText)).toBeTruthy();
  });

  test('Detail controls: Cancel when running; Retry when failed', async ({ page }) => {
    await page.clock.install();
    // Use a seed failed mission for retry visibility
    const failedRow = page.locator('[data-testid^="mission-row-"]').filter({ hasText: 'Seed Mission 2' }).first();
    await failedRow.click();
    await expect(page.getByTestId('btn-retry')).toBeEnabled();
    await page.getByTestId('btn-retry').click();
    await expect(page.getByTestId('btn-retry')).toBeDisabled(); // becomes queued; retry disabled until failed again
    await page.goBack();

    // Start fresh mission and cancel when running
    await page.getByTestId('btn-create-mission').click();
    await page.getByTestId('input-mission-name').fill('Cancelable Mission');
    await page.getByTestId('input-mission-goal').fill('Cancel test');
    await page.getByTestId('btn-submit-mission').click();
    const cancelRow = page.locator('[data-testid^="mission-row-"]').filter({ hasText: 'Cancelable Mission' }).first();
    const cancelId = await cancelRow.getAttribute('data-mission-id');
    await page.clock.fastForward(11_000);
    await cancelRow.click();
    await expect(page.getByTestId('btn-cancel')).toBeEnabled();
    await page.getByTestId('btn-cancel').click();
    await expect(page.getByTestId('btn-cancel')).toBeDisabled();
  });

  test('Live logs: appear during running and stop after terminal', async ({ page }) => {
    await page.clock.install();
    await page.getByTestId('btn-create-mission').click();
    await page.getByTestId('input-mission-name').fill('Logging Mission');
    await page.getByTestId('input-mission-goal').fill('Logs test');
    await page.getByTestId('btn-submit-mission').click();
    const logRow = page.locator('[data-testid^="mission-row-"]').filter({ hasText: 'Logging Mission' }).first();
    await page.clock.fastForward(11_000); // running
    await logRow.click();
    const logs = page.getByTestId('logs-container').locator('[data-testid="log-line"]');
    const initialCount = await logs.count();
    // Advance a few seconds to cross an even second boundary deterministically
    let increased = false;
    for (let i = 0; i < 5; i++) {
      await page.clock.fastForward(1_000);
      const c = await logs.count();
      if (c > initialCount) { increased = true; break; }
    }
    expect(increased).toBeTruthy();
    // Advance to terminal and confirm no more lines added
    await page.clock.fastForward(5_000);
    const countAtTerminal = await logs.count();
    await page.clock.fastForward(3_000);
    await expect(logs).toHaveCount(countAtTerminal);
  });

  test('Datasets: search and sort', async ({ page }) => {
    await page.getByTestId('nav-datasets').click();
    const firstBefore = await page.locator('[data-testid^="dataset-row-"]').first().innerText();
    // Sort by rows asc then desc
    await page.getByTestId('th-rows').click();
    const firstAsc = await page.locator('[data-testid^="dataset-row-"]').first().innerText();
    await page.getByTestId('th-rows').click();
    const firstDesc = await page.locator('[data-testid^="dataset-row-"]').first().innerText();
    expect(firstAsc).not.toEqual(firstDesc);
    // Search filters
    await page.getByTestId('datasets-search').fill('dataset_01');
    const rows = page.locator('[data-testid^="dataset-row-"]');
    await expect(rows).toHaveCount(1);
  });

  test('Pipeline: nodes and metadata panel', async ({ page }) => {
    await page.getByTestId('nav-pipeline').click();
    await expect(page.getByTestId('pipeline-node-n1')).toBeVisible();
    await page.getByTestId('pipeline-node-n1').click();
    await expect(page.getByTestId('pipeline-details')).toContainText(/Owner:/);
    await expect(page.getByTestId('pipeline-details')).toContainText(/Upstream|Downstream/);
  });

  test('Agent chat: send + markdown + reply', async ({ page }) => {
    await page.clock.install();
    const input = page.getByTestId('chat-input');
    await input.fill('Hello agent');
    // Press Enter to send
    await input.press('Enter');
    await expect(page.getByTestId('chat-msg-user').last()).toContainText('Hello agent');
    // Auto reply ~1s later
    await page.clock.fastForward(1000);
    await expect(page.getByTestId('chat-msg-agent').last()).toContainText('mocked response');
    // Markdown rendered: code block
    await expect(page.getByTestId('chat-msg-agent').last().locator('code')).toBeVisible();
  });
});
