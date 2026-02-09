import { test, expect } from '@playwright/test'

test.describe('Project Setup Flow', () => {
  test('setup form is visible with all fields', async ({ page }) => {
    await page.goto('/')

    const form = page.getByTestId('setup-form')
    await expect(form).toBeVisible()

    await expect(page.locator('#project-name')).toBeVisible()
    await expect(page.getByTestId('granularity-day')).toBeVisible()
    await expect(page.getByTestId('granularity-week')).toBeVisible()
    await expect(page.getByTestId('granularity-month')).toBeVisible()
    await expect(page.locator('#start-date')).toBeVisible()
    await expect(page.locator('#end-date')).toBeVisible()
    await expect(page.getByTestId('create-btn')).toBeVisible()
  })

  test('create button is disabled when form is incomplete', async ({ page }) => {
    await page.goto('/')

    const createBtn = page.getByTestId('create-btn')
    await expect(createBtn).toBeDisabled()
  })

  test('filling form and submitting shows timeline', async ({ page }) => {
    await page.goto('/')

    await page.locator('#project-name').fill('Test Project')
    await page.getByTestId('granularity-week').click()
    await page.locator('#start-date').fill('2026-03-01')
    await page.locator('#end-date').fill('2026-06-01')
    await page.getByTestId('template-clean-default').click()

    const createBtn = page.getByTestId('create-btn')
    await expect(createBtn).toBeEnabled()
    await createBtn.click()

    const timelineView = page.getByTestId('timeline-view')
    await expect(timelineView).toBeVisible()

    const container = page.getByTestId('timeline-container')
    await expect(container).toBeVisible()
  })

  test('template options are visible in setup', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('template-clean-default')).toBeVisible()
    await expect(page.getByTestId('template-corporate-blue')).toBeVisible()
    await expect(page.getByTestId('template-minimal-dark')).toBeVisible()
  })
})
