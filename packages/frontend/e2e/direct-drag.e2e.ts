import { test, expect, type Page } from '@playwright/test'

async function setupProject(page: Page) {
  await page.goto('/')
  await page.locator('#project-name').fill('Direct Drag Test')
  await page.getByTestId('granularity-day').click()
  await page.locator('#start-date').fill('2026-03-01')
  await page.locator('#end-date').fill('2026-06-01')
  await page.getByTestId('create-btn').click()
  await expect(page.getByTestId('timeline-container')).toBeVisible()
}

test.describe('Direct Drag Without Selection', () => {
  test('item can be dragged without clicking first', async ({ page }) => {
    await setupProject(page)

    // Add an item via sidebar
    await page.locator('text=Add New Task').click()
    const editor = page.getByTestId('item-editor')
    await expect(editor).toBeVisible({ timeout: 5000 })
    await page.getByTestId('item-save-btn').click()

    // Get the timeline item
    const item = page.locator('.vis-timeline .vis-item.timeline-item')
    await expect(item).toBeVisible({ timeout: 3000 })

    // Get initial position
    const initialBox = await item.boundingBox()
    expect(initialBox).toBeTruthy()
    if (!initialBox) return

    // Hover to trigger auto-select, then drag
    await item.hover()
    await page.waitForTimeout(100)
    await page.mouse.down()
    await page.mouse.move(initialBox.x + 100, initialBox.y + initialBox.height / 2, { steps: 10 })
    await page.mouse.up()

    // Wait for the item to move
    await page.waitForTimeout(500)

    // Verify the item moved
    const newBox = await item.boundingBox()
    expect(newBox).toBeTruthy()
    if (newBox) {
      expect(newBox.x).toBeGreaterThan(initialBox.x)
    }
  })

  test('item can be resized without clicking first', async ({ page }) => {
    await setupProject(page)

    // Add an item via sidebar
    await page.locator('text=Add New Task').click()
    const editor = page.getByTestId('item-editor')
    await expect(editor).toBeVisible({ timeout: 5000 })
    await page.getByTestId('item-save-btn').click()

    // Get the timeline item
    const item = page.locator('.vis-timeline .vis-item.timeline-item')
    await expect(item).toBeVisible({ timeout: 3000 })

    // Get initial width
    const initialBox = await item.boundingBox()
    expect(initialBox).toBeTruthy()
    if (!initialBox) return

    // Hover to auto-select, then grab the right resize handle
    await item.hover()
    await page.waitForTimeout(100)

    const rightEdgeX = initialBox.x + initialBox.width - 5
    const centerY = initialBox.y + initialBox.height / 2

    await page.mouse.move(rightEdgeX, centerY)
    await page.mouse.down()
    await page.mouse.move(rightEdgeX + 50, centerY, { steps: 10 })
    await page.mouse.up()

    // Wait for resize
    await page.waitForTimeout(500)

    // Verify the item was resized
    const newBox = await item.boundingBox()
    expect(newBox).toBeTruthy()
    if (newBox) {
      expect(newBox.width).toBeGreaterThan(initialBox.width)
    }
  })
})
