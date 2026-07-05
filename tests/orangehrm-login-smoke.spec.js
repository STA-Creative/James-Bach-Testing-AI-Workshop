const { test, expect } = require('@playwright/test');

test('OrangeHRM login page exposes core login controls', async ({ page }, testInfo) => {
  const consoleMessages = [];
  const failedRequests = [];

  page.on('console', (message) => {
    consoleMessages.push(`${message.type()}: ${message.text()}`);
  });
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText}`);
  });

  await page.goto('/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  await expect(page.getByPlaceholder('Username')).toBeVisible();
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();

  await page.screenshot({
    path: testInfo.outputPath('orangehrm-login-page.png'),
    fullPage: true,
  });

  console.log(JSON.stringify({
    title: await page.title(),
    url: page.url(),
    consoleMessages,
    failedRequests,
  }, null, 2));
});
