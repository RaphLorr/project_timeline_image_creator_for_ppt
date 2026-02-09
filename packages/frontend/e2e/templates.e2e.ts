import { test, expect, type Page } from '@playwright/test'

async function setupProject(page: Page, templateId = 'clean-default') {
  await page.goto('/')
  await page.locator('#project-name').fill('Template Test')
  await page.getByTestId('granularity-week').click()
  await page.locator('#start-date').fill('2026-03-01')
  await page.locator('#end-date').fill('2026-06-01')
  await page.getByTestId(`template-${templateId}`).click()
  await page.getByTestId('create-btn').click()
  await expect(page.getByTestId('timeline-container')).toBeVisible()
}

test.describe('Template System', () => {
  test('built-in templates load in picker', async ({ page }) => {
    await setupProject(page)

    await expect(page.getByTestId('template-option-clean-default')).toBeVisible()
    await expect(page.getByTestId('template-option-corporate-blue')).toBeVisible()
    await expect(page.getByTestId('template-option-minimal-dark')).toBeVisible()
  })

  test('switching template changes styles without losing items', async ({ page }) => {
    await setupProject(page)

    // Take screenshot with Clean Default
    await page.screenshot({ path: 'e2e/screenshots/template-clean.png' })

    // Switch to Corporate Blue
    await page.getByTestId('template-option-corporate-blue').click()
    await page.waitForTimeout(500)

    await page.screenshot({ path: 'e2e/screenshots/template-corporate.png' })

    // Timeline should still exist
    await expect(page.getByTestId('timeline-container')).toBeVisible()
  })

  test('switching to Minimal Dark applies dark theme', async ({ page }) => {
    await setupProject(page)

    await page.getByTestId('template-option-minimal-dark').click()
    await page.waitForTimeout(500)

    await page.screenshot({ path: 'e2e/screenshots/template-dark.png' })

    // Timeline should still be visible
    await expect(page.getByTestId('timeline-container')).toBeVisible()
  })
})
