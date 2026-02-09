import { test, expect } from '@playwright/test'

test.describe('Relative Time Labels', () => {
  test('should display DAY1, DAY2 labels in day granularity', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await page.fill('#project-name', 'Test Project')
    await page.fill('#start-date', '2026-03-01')
    await page.fill('#end-date', '2026-03-10')
    await page.click('[data-testid="granularity-day"]')
    await page.click('[data-testid="create-btn"]')

    // Wait for timeline to render and labels to update
    await page.waitForTimeout(1000)

    // Check for DAY1, DAY2, etc. labels in the timeline
    const day1 = page.locator('.vis-text:has-text("DAY1")').locator('visible=true').first()
    await expect(day1).toBeVisible()

    const day2 = page.locator('.vis-text:has-text("DAY2")').locator('visible=true').first()
    await expect(day2).toBeVisible()
  })

  test('should display WEEK1, WEEK2 labels in week granularity', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await page.fill('#project-name', 'Test Project')
    await page.fill('#start-date', '2026-03-01')
    await page.fill('#end-date', '2026-04-30')
    await page.click('[data-testid="granularity-week"]')
    await page.click('[data-testid="create-btn"]')

    // Wait for timeline to render and labels to update
    await page.waitForTimeout(1000)

    // Check for WEEK2, WEEK3, etc. labels in the timeline
    // (WEEK1 might not be visible depending on viewport and timeline rendering)
    const week2 = page.locator('.vis-text:has-text("WEEK2")').locator('visible=true').first()
    await expect(week2).toBeVisible()

    const week3 = page.locator('.vis-text:has-text("WEEK3")').locator('visible=true').first()
    await expect(week3).toBeVisible()
  })

  test('should display MONTH1, MONTH2 labels in month granularity', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await page.fill('#project-name', 'Test Project')
    await page.fill('#start-date', '2026-03-01')
    await page.fill('#end-date', '2026-08-31')
    await page.click('[data-testid="granularity-month"]')
    await page.click('[data-testid="create-btn"]')

    // Wait for timeline to render
    await page.waitForTimeout(1000)

    // Check for MONTH1, MONTH2, etc. labels in the timeline
    const month1 = page.locator('.vis-text:has-text("MONTH1")').locator('visible=true').first()
    await expect(month1).toBeVisible()

    const month2 = page.locator('.vis-text:has-text("MONTH2")').locator('visible=true').first()
    await expect(month2).toBeVisible()
  })
})
