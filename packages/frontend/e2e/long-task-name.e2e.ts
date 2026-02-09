import { test, expect, type Page } from '@playwright/test'

const LONG_TASK_NAME = 'This is a very long task name that should be truncated on the timeline bar'

async function setupProjectAndAddLongItem(page: Page) {
  await page.goto('/')
  await page.locator('#project-name').fill('Long Name Test')
  await page.getByTestId('granularity-day').click()
  await page.locator('#start-date').fill('2026-03-01')
  await page.locator('#end-date').fill('2026-06-01')
  await page.getByTestId('create-btn').click()
  await expect(page.getByTestId('timeline-container')).toBeVisible()

  // Double-click to add item
  const contentPanel = page.locator('.vis-panel.vis-center')
  await expect(contentPanel).toBeVisible()
  const box = await contentPanel.boundingBox()
  if (!box) throw new Error('Content panel not found')
  await page.mouse.dblclick(box.x + box.width / 3, box.y + box.height / 2)

  // Edit the item name to something long
  const editor = page.getByTestId('item-editor')
  await expect(editor).toBeVisible({ timeout: 5000 })
  const nameInput = page.getByTestId('item-name-input')
  await nameInput.clear()
  await nameInput.fill(LONG_TASK_NAME)
  await page.getByTestId('item-save-btn').click()
}

test.describe('Long Task Name Display', () => {
  test('timeline bar shows tooltip on hover with full text', async ({ page }) => {
    await setupProjectAndAddLongItem(page)

    const timelineItem = page.locator('.vis-timeline .vis-item.timeline-item')
    await expect(timelineItem).toBeVisible({ timeout: 3000 })

    // Hover over the item to trigger vis-timeline tooltip
    await timelineItem.hover()

    // vis-timeline shows title in a .vis-tooltip element after a delay
    const tooltip = page.locator('.vis-tooltip')
    await expect(tooltip).toBeVisible({ timeout: 3000 })
    await expect(tooltip).toContainText(LONG_TASK_NAME)
  })

  test('long item gets smaller font class on timeline bar', async ({ page }) => {
    await setupProjectAndAddLongItem(page)

    const timelineItem = page.locator('.vis-timeline .vis-item.timeline-item-long')
    await expect(timelineItem).toBeVisible({ timeout: 3000 })

    // Verify the smaller font is applied
    const content = timelineItem.locator('.vis-item-content')
    await expect(content).toHaveCSS('font-size', '11px')
  })

  test('sidebar task card has title tooltip with full text', async ({ page }) => {
    await setupProjectAndAddLongItem(page)

    // TaskCard h4 should have title with the full name
    const cardTitle = page.locator('h4.truncate')
    await expect(cardTitle).toBeVisible({ timeout: 3000 })
    await expect(cardTitle).toHaveAttribute('title', LONG_TASK_NAME)
  })

  test('short task name does not get long class', async ({ page }) => {
    await page.goto('/')
    await page.locator('#project-name').fill('Short Name Test')
    await page.getByTestId('granularity-day').click()
    await page.locator('#start-date').fill('2026-03-01')
    await page.locator('#end-date').fill('2026-06-01')
    await page.getByTestId('create-btn').click()
    await expect(page.getByTestId('timeline-container')).toBeVisible()

    // Double-click to add item
    const contentPanel = page.locator('.vis-panel.vis-center')
    await expect(contentPanel).toBeVisible()
    const box = await contentPanel.boundingBox()
    if (!box) throw new Error('Content panel not found')
    await page.mouse.dblclick(box.x + box.width / 3, box.y + box.height / 2)

    // Save with short name
    const editor = page.getByTestId('item-editor')
    await expect(editor).toBeVisible({ timeout: 5000 })
    const nameInput = page.getByTestId('item-name-input')
    await nameInput.clear()
    await nameInput.fill('Short')
    await page.getByTestId('item-save-btn').click()

    // Should have timeline-item but NOT timeline-item-long
    const timelineItem = page.locator('.vis-timeline .vis-item.timeline-item')
    await expect(timelineItem).toBeVisible({ timeout: 3000 })
    await expect(page.locator('.vis-timeline .vis-item.timeline-item-long')).toHaveCount(0)
  })
})
