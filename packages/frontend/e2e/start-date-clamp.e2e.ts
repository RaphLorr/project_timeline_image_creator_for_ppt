import { test, expect, type Page } from '@playwright/test'

async function setupProject(page: Page, startDate: string) {
  await page.goto('/')
  await page.locator('#project-name').fill('Clamp Test')
  await page.getByTestId('granularity-day').click()
  await page.locator('#start-date').fill(startDate)
  await page.locator('#end-date').fill('2026-06-01')
  await page.getByTestId('create-btn').click()
  await expect(page.getByTestId('timeline-container')).toBeVisible()
}

test.describe('Start Date Clamping', () => {
  test('item added via sidebar starts at project start date', async ({ page }) => {
    const projectStart = '2026-03-15'
    await setupProject(page, projectStart)

    // Add item via sidebar — should start at project start date
    await page.locator('text=Add New Task').click()
    const editor = page.getByTestId('item-editor')
    await expect(editor).toBeVisible({ timeout: 5000 })
    await page.getByTestId('item-save-btn').click()

    // Check the sidebar card shows the date starting at Mar 15
    const dateText = page.locator('text=Mar 15')
    await expect(dateText).toBeVisible({ timeout: 3000 })
  })

  test('item added via double-click is not before project start date', async ({ page }) => {
    const projectStart = '2026-03-10'
    await setupProject(page, projectStart)

    // Double-click at the leftmost edge of the timeline content area
    const contentPanel = page.locator('.vis-panel.vis-center')
    await expect(contentPanel).toBeVisible()
    const box = await contentPanel.boundingBox()
    if (!box) throw new Error('Content panel not found')

    // Click near the left edge — could map to a date before start
    await page.mouse.dblclick(box.x + 5, box.y + box.height / 2)

    const editor = page.getByTestId('item-editor')
    await expect(editor).toBeVisible({ timeout: 5000 })
    await page.getByTestId('item-save-btn').click()

    // Verify item start date in sidebar is >= Mar 10
    const sidebar = page.locator('[class*="text-slate-400"]').filter({ hasText: /Mar \d+/ })
    await expect(sidebar.first()).toBeVisible({ timeout: 3000 })
    const dateStr = await sidebar.first().textContent()
    expect(dateStr).toBeTruthy()

    const match = dateStr?.match(/Mar (\d+)/)
    expect(match).toBeTruthy()
    if (match) {
      const dayNum = parseInt(match[1], 10)
      expect(dayNum).toBeGreaterThanOrEqual(10)
    }
  })

  test('timeline items do not show selection outline', async ({ page }) => {
    await setupProject(page, '2026-03-01')

    // Add an item
    await page.locator('text=Add New Task').click()
    const editor = page.getByTestId('item-editor')
    await expect(editor).toBeVisible({ timeout: 5000 })
    await page.getByTestId('item-save-btn').click()

    // Click the timeline item to "select" it
    const item = page.locator('.vis-timeline .vis-item.timeline-item')
    await expect(item).toBeVisible({ timeout: 3000 })
    await item.click()

    // Even after click, no outline should be visible
    await expect(item).toHaveCSS('outline-style', 'none')
  })
})
