import { test, expect, type Page } from '@playwright/test'

async function setupProject(page: Page) {
  await page.goto('/')
  await page.locator('#project-name').fill('Row Test')
  await page.getByTestId('granularity-day').click()
  await page.locator('#start-date').fill('2026-03-01')
  await page.locator('#end-date').fill('2026-06-01')
  await page.getByTestId('create-btn').click()
  await expect(page.getByTestId('timeline-container')).toBeVisible()
}

async function addItemViaSidebar(page: Page) {
  await page.locator('text=Add New Task').click()
  const editor = page.getByTestId('item-editor')
  await expect(editor).toBeVisible({ timeout: 5000 })
  await page.getByTestId('item-save-btn').click()
  await expect(editor).not.toBeVisible()
}

test.describe('Row Arrangement', () => {
  test('two items are placed on separate rows by default', async ({ page }) => {
    await setupProject(page)

    // Add two items
    await addItemViaSidebar(page)
    await addItemViaSidebar(page)

    // Each item should be in its own group (row) with different vertical positions
    const items = page.locator('.vis-timeline .vis-item.timeline-item')
    await expect(items).toHaveCount(2, { timeout: 3000 })

    const firstBox = await items.nth(0).boundingBox()
    const secondBox = await items.nth(1).boundingBox()
    expect(firstBox).toBeTruthy()
    expect(secondBox).toBeTruthy()
    if (firstBox && secondBox) {
      // Items on separate rows have different vertical positions
      expect(firstBox.y).not.toEqual(secondBox.y)
    }
  })

  test('group labels are not visible in the timeline', async ({ page }) => {
    await setupProject(page)
    await addItemViaSidebar(page)

    // The left panel (group labels) should be hidden via CSS
    const leftPanel = page.locator('.vis-timeline .vis-panel.vis-left')
    await expect(leftPanel).not.toBeVisible()
  })

  test('three items each get their own row', async ({ page }) => {
    await setupProject(page)

    await addItemViaSidebar(page)
    await addItemViaSidebar(page)
    await addItemViaSidebar(page)

    const items = page.locator('.vis-timeline .vis-item.timeline-item')
    await expect(items).toHaveCount(3, { timeout: 3000 })

    // Collect vertical positions
    const positions: number[] = []
    for (let i = 0; i < 3; i++) {
      const box = await items.nth(i).boundingBox()
      expect(box).toBeTruthy()
      if (box) positions.push(box.y)
    }

    // All three items should have unique Y positions (separate rows)
    const uniquePositions = new Set(positions)
    expect(uniquePositions.size).toBe(3)
  })
})
