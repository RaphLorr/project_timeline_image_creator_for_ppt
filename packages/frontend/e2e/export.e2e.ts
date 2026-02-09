import { test, expect, type Page } from '@playwright/test'

async function setupProject(page: Page) {
  await page.goto('/')
  await page.locator('#project-name').fill('Export Test')
  await page.getByTestId('granularity-week').click()
  await page.locator('#start-date').fill('2026-03-01')
  await page.locator('#end-date').fill('2026-06-01')
  await page.getByTestId('create-btn').click()
  await expect(page.getByTestId('timeline-container')).toBeVisible()
}

test.describe('Export', () => {
  test('PNG export button triggers download', async ({ page }) => {
    await setupProject(page)

    const downloadPromise = page.waitForEvent('download', { timeout: 10000 })
    await page.getByTestId('export-png-btn').click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.png$/)
  })

  test('HTML export button triggers download', async ({ page }) => {
    await setupProject(page)

    const downloadPromise = page.waitForEvent('download', { timeout: 10000 })
    await page.getByTestId('export-html-btn').click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.html$/)
  })
})
