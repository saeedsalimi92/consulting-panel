import { expect, test, type Page } from '@playwright/test'

const apiUrl = process.env.PANEL_E2E_API_URL || ''
const testDatabase = 'consulting_booking_test_20261012'
const apiTarget = apiUrl ? new URL(apiUrl) : null
const isolatedTargetConfirmed = !!apiTarget
  && ['localhost', '127.0.0.1'].includes(apiTarget.hostname)
  && ['8011', '8012'].includes(apiTarget.port)
  && process.env.PANEL_E2E_DB_NAME === testDatabase
  && process.env.PANEL_E2E_DB_CONFIRMED === testDatabase

async function loginAdmin(page: Page, email: string, password: string) {
  await page.goto('/auth/login')
  await page.locator('#login-email').fill(email)
  await page.locator('#login-password').fill(password)
  await page.getByRole('button', { name: 'ورود به فضای کاری' }).click()
}

test('login view is Persian RTL and renders without sending a request', async ({ page }) => {
  await page.goto('/auth/login')
  await expect(page.locator('main.login-page')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('heading', { name: 'ورود به پنل مدیریت' })).toBeVisible()
})

test.describe('isolated admin and reception auth', () => {
  test.skip(!isolatedTargetConfirmed, `Requires confirmed ${testDatabase} and an API other than port 8010.`)
  test.skip(!process.env.PANEL_E2E_ADMIN_EMAIL || !process.env.PANEL_E2E_ADMIN_PASSWORD, 'Admin test credentials are not configured.')

  test('admin login, refresh restores session, and logout revokes it', async ({ page }) => {
    await loginAdmin(page, process.env.PANEL_E2E_ADMIN_EMAIL!, process.env.PANEL_E2E_ADMIN_PASSWORD!)
    await expect(page).toHaveURL(/\/$/)
    await page.reload()
    await expect(page).not.toHaveURL(/auth\/login/)
    await page.locator('.top-header').getByRole('button', { name: 'خروج' }).click()
    await expect(page).toHaveURL(/auth\/login/)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('admin-token'))).toBeNull()
  })
})

test.describe('isolated reception authorization', () => {
  test.skip(!isolatedTargetConfirmed, `Requires confirmed ${testDatabase} and an API other than port 8010.`)
  test.skip(!process.env.PANEL_E2E_RECEPTION_EMAIL || !process.env.PANEL_E2E_RECEPTION_PASSWORD, 'Reception test credentials are not configured.')

  test('reception login opens booking workspace and blocks admin dashboard', async ({ page }) => {
    await loginAdmin(page, process.env.PANEL_E2E_RECEPTION_EMAIL!, process.env.PANEL_E2E_RECEPTION_PASSWORD!)
    await expect(page).toHaveURL(/\/booking(?:\/|$)/)
    await page.goto('/')
    await expect(page).toHaveURL(/forbidden/)
  })
})

test.describe('isolated counselor authorization', () => {
  test.skip(!isolatedTargetConfirmed, `Requires confirmed ${testDatabase} and an API other than port 8010.`)
  test.skip(!process.env.PANEL_E2E_COUNSELOR_EMAIL || !process.env.PANEL_E2E_COUNSELOR_PASSWORD, 'Counselor test credentials are not configured.')

  test('counselor login, session restore, and logout', async ({ page }) => {
    await page.goto('/counselor/login')
    await page.locator('.counselor-login input[type="email"]').fill(process.env.PANEL_E2E_COUNSELOR_EMAIL!)
    await page.locator('.counselor-login input[type="password"]').fill(process.env.PANEL_E2E_COUNSELOR_PASSWORD!)
    await page.getByRole('button', { name: 'ورود به پنل مشاور' }).click()
    await expect(page).toHaveURL(/\/counselor$/)
    await page.reload()
    await expect(page).toHaveURL(/\/counselor$/)
    await page.locator('.counselor-portal__header').getByRole('button', { name: 'خروج' }).click()
    await expect(page).toHaveURL(/counselor\/login/)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('counselor-token'))).toBeNull()
  })
})
