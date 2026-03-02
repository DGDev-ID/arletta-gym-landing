import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  // The app hero text is dynamic / contains markup; assert a stable substring instead
  await expect(page.locator('h1')).toContainText('Transform Your Body')
})
