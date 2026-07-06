const { test, expect } = require('@playwright/test');

const LOGIN_PATH = '/web/index.php/auth/login';
const DASHBOARD_PATH = '/web/index.php/dashboard/index';
const VALID_USER = 'Admin';
const VALID_PASSWORD = 'admin123';

async function collectSignals(page) {
  const signals = {
    consoleMessages: [],
    failedRequests: [],
    responses: [],
  };

  page.on('console', (message) => {
    signals.consoleMessages.push(`${message.type()}: ${message.text()}`);
  });
  page.on('requestfailed', (request) => {
    signals.failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText}`);
  });
  page.on('response', (response) => {
    const status = response.status();
    if (status >= 400) {
      signals.responses.push(`${status} ${response.url()}`);
    }
  });

  return signals;
}

async function gotoLogin(page) {
  await page.goto(LOGIN_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
}

async function login(page, username = VALID_USER, password = VALID_PASSWORD) {
  await gotoLogin(page);
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: /login/i }).click();
}

test.describe('OrangeHRM authentication/session exploratory checks', () => {
  test('blank login submission explains required fields without leaving login page', async ({ page }, testInfo) => {
    const signals = await collectSignals(page);
    await gotoLogin(page);

    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText('Required')).toHaveCount(2);
    await expect(page).toHaveURL(new RegExp(`${LOGIN_PATH.replace(/\//g, '\\/')}$`));

    await page.screenshot({
      path: testInfo.outputPath('blank-login-required-fields.png'),
      fullPage: true,
    });

    console.log(JSON.stringify({
      charter: 'Observe whether empty credential mistakes are blocked and explained locally.',
      result: 'Two Required messages appeared and the user stayed on the login page.',
      signals,
    }, null, 2));
  });

  test('invalid credentials are rejected with a specific visible message', async ({ page }, testInfo) => {
    const signals = await collectSignals(page);
    await login(page, 'not-a-user', 'not-a-password');

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('invalid-credentials-message.png'),
      fullPage: true,
    });

    console.log(JSON.stringify({
      charter: 'Check whether wrong credentials fail closed and give user-facing feedback.',
      result: 'Invalid credentials message appeared and dashboard was not reached.',
      signals,
    }, null, 2));
  });

  test('valid login reaches dashboard and survives reload', async ({ page }, testInfo) => {
    const signals = await collectSignals(page);
    await login(page);

    await expect(page).toHaveURL(/\/web\/index\.php\/dashboard\/index/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('dashboard-after-login-reload.png'),
      fullPage: true,
    });

    console.log(JSON.stringify({
      charter: 'Check whether successful authentication establishes a usable session.',
      result: 'Dashboard loaded after login and remained available after reload.',
      signals,
    }, null, 2));
  });

  test('logged-out user is redirected away from dashboard', async ({ page }, testInfo) => {
    const signals = await collectSignals(page);

    await page.goto(DASHBOARD_PATH, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/web\/index\.php\/auth\/login/);
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('dashboard-direct-access-redirect.png'),
      fullPage: true,
    });

    console.log(JSON.stringify({
      charter: 'Check whether direct dashboard access without a session fails closed.',
      result: 'Direct dashboard request redirected to login.',
      signals,
    }, null, 2));
  });

  test('logout removes dashboard access in the same browser context', async ({ page }, testInfo) => {
    const signals = await collectSignals(page);
    await login(page);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: /logout/i }).click();
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

    await page.goto(DASHBOARD_PATH, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/web\/index\.php\/auth\/login/);
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('after-logout-dashboard-redirect.png'),
      fullPage: true,
    });

    console.log(JSON.stringify({
      charter: 'Check whether logout terminates dashboard access in the same browser context.',
      result: 'After logout, direct dashboard access redirected to login.',
      signals,
    }, null, 2));
  });
});
