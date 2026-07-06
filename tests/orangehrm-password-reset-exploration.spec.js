const { test, expect } = require('@playwright/test');

const LOGIN_PATH = '/web/index.php/auth/login';
const RESET_PATH = '/web/index.php/auth/requestPasswordResetCode';

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

async function gotoReset(page) {
  await page.goto(RESET_PATH, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
}

test.describe('OrangeHRM password reset exploratory checks', () => {
  test('reset page exposes basic recovery controls', async ({ page }, testInfo) => {
    const signals = await collectSignals(page);
    await gotoReset(page);

    await expect(page.getByText(/please enter your username/i)).toBeVisible();
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^reset password$/i })).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('reset-page-controls.png'),
      fullPage: true,
    });

    console.log(JSON.stringify({
      charter: 'Recon the password reset page and identify the available controls.',
      result: 'Reset page showed username input, Cancel, and Reset Password controls.',
      signals,
    }, null, 2));
  });

  test('blank reset submission explains required username locally', async ({ page }, testInfo) => {
    const signals = await collectSignals(page);
    await gotoReset(page);

    await page.getByRole('button', { name: /^reset password$/i }).click();

    await expect(page.getByText('Required')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${RESET_PATH.replace(/\//g, '\\/')}$`));

    await page.screenshot({
      path: testInfo.outputPath('blank-reset-required-username.png'),
      fullPage: true,
    });

    console.log(JSON.stringify({
      charter: 'Check whether blank reset requests are blocked and explained.',
      result: 'Required message appeared and the user stayed on the reset page.',
      signals,
    }, null, 2));
  });

  test('unknown username receives generic reset-sent feedback', async ({ page }, testInfo) => {
    const signals = await collectSignals(page);
    await gotoReset(page);

    await page.getByPlaceholder('Username').fill('not-a-user');
    await page.getByRole('button', { name: /^reset password$/i }).click();

    await expect(page).toHaveURL(/\/web\/index\.php\/auth\/sendPasswordReset/);
    await expect(page.getByText(/reset password link sent successfully/i)).toBeVisible();
    await expect(page.getByText(/a reset password link has been sent/i)).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('unknown-user-reset-generic-success.png'),
      fullPage: true,
    });

    console.log(JSON.stringify({
      charter: 'Check whether unknown usernames reveal account existence during reset.',
      result: 'Unknown username received generic reset-sent feedback, which does not reveal whether the account exists.',
      signals,
    }, null, 2));
  });

  test('cancel returns from reset page to login page', async ({ page }, testInfo) => {
    const signals = await collectSignals(page);
    await gotoReset(page);

    await page.getByRole('button', { name: /cancel/i }).click();

    await expect(page).toHaveURL(new RegExp(`${LOGIN_PATH.replace(/\//g, '\\/')}$`));
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('reset-cancel-returns-login.png'),
      fullPage: true,
    });

    console.log(JSON.stringify({
      charter: 'Check whether users can recover from the reset page back to login.',
      result: 'Cancel returned to the login page.',
      signals,
    }, null, 2));
  });
});
