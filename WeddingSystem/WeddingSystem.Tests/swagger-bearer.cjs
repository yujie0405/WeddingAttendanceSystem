// Optional browser regression check. No real credentials, screenshots, or token logs.
const assert = require('node:assert/strict');
const { chromium } = require('../.browser-tools/node_modules/playwright');

(async () => {
  const base = process.env.SWAGGER_TEST_URL || 'http://127.0.0.1:5252';
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const syntheticToken = 'swagger-browser-check-not-a-real-user-token';
    let headerVerified = false;
    // Inspect the actual Swagger-generated request, then fulfill locally.
    // Never send this synthetic token to Supabase or execute a database query.
    await page.route('**/api/guest-tags', async route => {
      const headers = await route.request().allHeaders();
      headerVerified = headers.authorization === `Bearer ${syntheticToken}`;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.goto(`${base}/swagger/index.html`);
    await page.getByRole('button', { name: 'Authorize', exact: true }).first().click();
    const dialog = page.locator('.dialog-ux');
    await dialog.locator('.auth-container input[type="text"]').fill(syntheticToken);
    await dialog.locator('.auth-btn-wrapper button.authorize').click();
    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    const operation = page.locator('.opblock-get').filter({
      has: page.locator('.opblock-summary-path[data-path="/api/guest-tags"]')
    });
    await operation.locator('.opblock-summary').click();
    await operation.getByRole('button', { name: 'Try it out', exact: true }).click();
    const response = page.waitForResponse(r => new URL(r.url()).pathname === '/api/guest-tags');
    await operation.getByRole('button', { name: 'Execute', exact: true }).click();
    await response;
    assert.ok(headerVerified, 'Swagger request must contain the Bearer Authorization header.');
    const anonymous = await fetch(`${base}/api/guest-tags`);
    assert.ok(anonymous.status === 401, 'The real API must still reject unauthenticated requests.');
    console.log('PASS: Swagger Authorize adds Authorization: Bearer <access_token>.');
    console.log('PASS: The protected guest-tags endpoint still rejects anonymous requests.');
  } finally {
    await browser.close();
  }
})().catch(() => {
  // Do not dump browser request details: they may contain Authorization headers.
  console.error('FAIL: Swagger Bearer browser verification did not complete. No credentials were logged.');
  process.exitCode = 1;
});
