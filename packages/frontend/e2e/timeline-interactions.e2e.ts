import { test, expect, type Page } from '@playwright/test'

async function setupProject(page: Page) {
  await page.goto('/')
  await page.locator('#project-name').fill('Test Project')
  await page.getByTestId('granularity-week').click()
  await page.locator('#start-date').fill('2026-03-01')
  await page.locator('#end-date').fill('2026-06-01')
  await page.getByTestId('create-btn').click()
  await expect(page.getByTestId('timeline-container')).toBeVisible()
}

test.describe('Timeline Interactions', () => {
  test('timeline renders after project setup', async ({ page }) => {
    await setupProject(page)

    const container = page.getByTestId('timeline-container')
    await expect(container).toBeVisible()

    // vis-timeline creates a vis-timeline element
    const timeline = container.locator('.vis-timeline')
    await expect(timeline).toBeVisible()
  })

  test('clicking empty space creates an item and opens editor', async ({ page }) => {
    await setupProject(page)

    // Target the vis-timeline content panel specifically
    const contentPanel = page.locator('.vis-panel.vis-center')
    await expect(contentPanel).toBeVisible()
    const box = await contentPanel.boundingBox()
    if (!box) throw new Error('Content panel not found')

    // Double-click in the center of the content area (below time axis)
    await page.mouse.dblclick(box.x + box.width / 3, box.y + box.height / 2)

    // Item editor should appear
    const editor = page.getByTestId('item-editor')
    await expect(editor).toBeVisible({ timeout: 5000 })
  })

  test('export buttons are visible in header', async ({ page }) => {
    await setupProject(page)

    await expect(page.getByTestId('export-png-btn')).toBeVisible()
    await expect(page.getByTestId('export-html-btn')).toBeVisible()
  })

  test('template picker is visible and switchable', async ({ page }) => {
    await setupProject(page)

    const picker = page.getByTestId('template-picker')
    await expect(picker).toBeVisible()

    // Switch template
    await page.getByTestId('template-option-corporate-blue').click()

    // Timeline should still be visible after template switch
    await expect(page.getByTestId('timeline-container')).toBeVisible()
  })
})
