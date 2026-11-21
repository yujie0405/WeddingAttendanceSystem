// Synthetic API browser integration. Never use real accounts or log credentials.
const assert = require('node:assert/strict');
const { chromium } = require('../../WeddingSystem/.browser-tools/node_modules/playwright');
const { createHmac } = require('node:crypto');
let stage = 'login';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);
    const id = '11111111-1111-4111-8111-111111111111';
    const user = { email: 'reception@example.test' };
    const base64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    const payload = `${base64({ alg: 'HS256', typ: 'JWT' })}.${base64({ sub: id, aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}`;
    const token = `${payload}.${createHmac('sha256', 'synthetic-browser-test-only').update(payload).digest('base64url')}`;
    let currentRole = 'admin', authRequests = 0, apiRequests = 0, moneyRequests = 0;
    let failNextGuestFetch = false, failOneGuestAmount = false;
    const tags = [{ id: 7, name: 'Friends' }];
    const statuses = [{ id: 10, name: 'Pending' }, { id: 20, name: 'Arrived' }];
    let guests = Array.from({ length: 21 }, (_, index) => ({
      id: index + 1, guestName: `Guest ${index + 1}`, relationId: 7, relationship: 'Friends',
      weddingSide: 1, guestNum: 1, attendanceStatusId: 10, attendanceStatus: 'Pending',
      tableNumber: 5, createdDate: new Date().toISOString()
    }));
    const amounts = Object.fromEntries(guests.map(guest => [guest.id, 0]));
    const checks = [];
    checks.push = label => {
      console.log(`PASS: ${label}`);
      return Array.prototype.push.call(checks, label);
    };
    page.on('pageerror', () => errors.push('Browser runtime error'));
    await page.addInitScript(() => {
      localStorage.setItem('wedding-language', 'en');
      localStorage.setItem('wedding-react-v2', 'preserved-legacy-backup-sentinel');
    });
    await page.route('http://127.0.0.1:5253/api/**', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname.replace('/api', '');
      if (path === '/auth/login') {
        const body = request.postDataJSON();
        assert.ok(body.email === user.email && body.password === 'synthetic-test-password', 'Login must send email and password.');
        authRequests++;
        return route.fulfill({ json: { accessToken: token } });
      }
      const headers = await request.allHeaders();
      // Boolean assertion avoids ever printing the header value on failure.
      assert.ok(headers.authorization === `Bearer ${token}`, 'API request is missing the user Bearer header.');
      apiRequests++;
      const method = request.method();
      if (path === '/auth/me') return route.fulfill({ json: { id, name: user.email, role: currentRole } });
      if (path === '/guest-tags') {
        if (method === 'POST') { tags.push({ id: 8, name: request.postDataJSON().tagName }); return route.fulfill({ status: 201, json: tags.at(-1) }); }
        return route.fulfill({ json: tags });
      }
      if (path.startsWith('/guest-tags/') && method === 'DELETE') {
        return route.fulfill({ status: 409, json: { code: 'TAG_IN_USE' } });
      }
      if (path === '/tables') {
        return route.fulfill({ json: [5, 6].map(tableNumber => ({
          tableNumber, capacity: 25, guestTagId: null,
          assignedCount: guests.filter(guest => guest.tableNumber === tableNumber)
            .reduce((total, guest) => total + guest.guestNum, 0),
        })) });
      }
      if (path === '/attendance-statuses') return route.fulfill({ json: statuses });
      if (path === '/summary/attendance') return route.fulfill({ json: {
        arrivedPeople: guests.filter(guest => guest.attendanceStatusId === 20)
          .reduce((total, guest) => total + guest.guestNum, 0),
        totalPeople: guests.reduce((total, guest) => total + guest.guestNum, 0),
      } });
      if (path === '/guests' && method === 'GET') {
        if (failNextGuestFetch) { failNextGuestFetch = false; return route.fulfill({ status: 503, json: {} }); }
        const term = (url.searchParams.get('search') || '').toLowerCase();
        const selected = guests.filter(guest => guest.guestName.toLowerCase().includes(term));
        const pageNumber = Number(url.searchParams.get('page') || 1);
        return route.fulfill({ json: { items: selected.slice((pageNumber - 1) * 20, pageNumber * 20), page: pageNumber, pageSize: 20, totalCount: selected.length } });
      }
      if (path === '/guests' && method === 'POST') {
        const body = request.postDataJSON();
        const guest = { ...body, id: 22, relationship: tags.find(tag => tag.id === body.relationId).name, attendanceStatus: 'Pending', createdDate: new Date().toISOString() };
        guests.push(guest); amounts[22] = 0;
        return route.fulfill({ status: 201, json: guest });
      }
      const match = path.match(/^\/guests\/(\d+)(\/attendance)?$/);
      if (match && method === 'DELETE') {
        assert.equal(currentRole, 'admin');
        const id = Number(match[1]);
        guests = guests.filter(guest => guest.id !== id);
        delete amounts[id];
        return route.fulfill({ status: 204 });
      }
      if (match && method === 'PUT') {
        const guest = guests.find(item => item.id === Number(match[1]));
        const body = request.postDataJSON();
        Object.assign(guest, body);
        guest.attendanceStatus = statuses.find(status => status.id === guest.attendanceStatusId).name;
        return route.fulfill({ json: guest });
      }
      if (path.includes('/angpau')) {
        moneyRequests++;
        assert.ok(currentRole === 'admin', 'Staff must not request financial endpoints.');
        if (path === '/admin/summary/angpau') return route.fulfill({ json: { amount: Object.values(amounts).reduce((a, b) => a + b, 0), currency: 'MYR' } });
        const guestId = Number(path.match(/\/guests\/(\d+)/)[1]);
        if (failOneGuestAmount && guestId === 2 && method === 'GET') {
          return route.fulfill({ status: 503, json: {} });
        }
        if (method === 'PUT') amounts[guestId] = request.postDataJSON().amount;
        return route.fulfill({ json: { guestId, amount: amounts[guestId] } });
      }
      throw new Error('Unexpected API route in browser test');
    });
    await page.goto('http://127.0.0.1:5174/login');
    await page.getByLabel('Email', { exact: true }).fill(user.email);
    await page.getByLabel('Password', { exact: true }).fill('synthetic-test-password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.locator('[data-guest-id="1"]').waitFor();
    assert.ok(authRequests === 1 && apiRequests > 0, 'Login and API data loading must run.');
    checks.push('API email/password login and Bearer-authenticated data loading');
    stage = 'pagination next';
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.locator('[data-guest-id="21"]').waitFor();
    stage = 'pagination previous';
    await page.getByRole('button', { name: 'Previous', exact: true }).click();
    await page.locator('[data-guest-id="1"]').waitFor();
    const first = page.locator('[data-guest-id="1"]');
    stage = 'attendance button';
    await first.getByRole('button', { name: 'Arrived', exact: true }).click();
    stage = 'attendance save response';
    await page.getByText('Saved', { exact: true }).waitFor();
    await page.locator('[data-guest-id="1"]').waitFor();
    assert.ok(guests[0].attendanceStatusId === 20, 'Attendance must save the actual lookup ID.');
    await page.getByRole('heading', { name: 'Attended guests', exact: true }).locator('..')
      .getByText('4.8%', { exact: true }).waitFor();
    checks.push('Server pagination and attendance persistence');
    assert.equal(await first.getByRole('button', { name: 'Edit', exact: true }).count(), 0);
    await page.getByRole('link', { name: 'Admin settings', exact: true }).click();
    await page.getByRole('link', { name: 'Add / Edit Guests', exact: true }).click();
    await page.locator('[data-guest-id="1"]').getByRole('button', { name: 'Edit', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Guest name', { exact: true }).fill('Updated Guest');
    await dialog.getByLabel('Number of people', { exact: true }).fill('3');
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    await page.getByRole('heading', { name: 'Updated Guest', exact: true }).waitFor();
    assert.ok(guests[0].guestNum === 3 && amounts[1] === 0, 'Editing must preserve party size and not change money.');
    checks.push('Guest editing saves real IDs and party size');
    stage = 'guest creation';
    const addForm = page.getByRole('heading', { name: 'Add guest', exact: true }).locator('..');
    stage = 'new guest name';
    await addForm.getByLabel('Guest name', { exact: true }).fill('New Arrival');
    await addForm.getByLabel('Relationship', { exact: true }).selectOption('7');
    stage = 'new guest attendance';
    await addForm.getByRole('button', { name: 'Pending', exact: true }).click();
    stage = 'new guest table';
    await addForm.getByLabel('Table', { exact: true }).selectOption('6');
    const partySize = addForm.getByLabel('Number of people', { exact: true });
    stage = 'table capacity feedback';
    await partySize.fill('26');
    await addForm.getByRole('alert').waitFor();
    assert.ok(await addForm.getByRole('button', { name: 'Save', exact: true }).isDisabled());
    stage = 'new guest save';
    await partySize.fill('2');
    await addForm.getByRole('button', { name: 'Save', exact: true }).click();
    await page.getByText('22 guest records', { exact: true }).waitFor();
    assert.ok(guests.at(-1).guestNum === 2 && guests.at(-1).tableNumber === 6, 'Guest creation must send numeric API fields.');
    await page.reload();
    await page.getByText('22 guest records', { exact: true }).waitFor();
    assert.ok(authRequests === 1, 'Reload must restore the existing API session.');
    checks.push('Guest creation and authenticated session restoration after reload');
    stage = 'guest deletion';
    await page.getByRole('searchbox').fill('New Arrival');
    const newGuest = page.locator('[data-guest-id="22"]');
    await newGuest.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
    assert.ok(guests.some(guest => guest.id === 22));
    await newGuest.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
    await newGuest.waitFor({ state: 'hidden' });
    await page.getByText('Saved', { exact: true }).waitFor();
    assert.ok(guests.every(guest => guest.id !== 22));
    checks.push('Table capacity feedback and confirmed guest deletion');
    stage = 'administrator money';
    failOneGuestAmount = true;
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await page.getByRole('alert').getByRole('button', { name: 'Retry' }).waitFor();
    await page.locator('[data-guest-id="2"]').waitFor();
    assert.equal(await page.locator('[data-guest-id]').count(), 20);
    checks.push('Unfiltered dashboard displays the first guest page despite a failed angpau request');
    failOneGuestAmount = false;
    await page.getByRole('alert').getByRole('button', { name: 'Retry' }).click();
    const attendanceCard = page.getByRole('heading', { name: 'Attended guests', exact: true }).locator('..');
    await attendanceCard.getByText('13%', { exact: true }).waitFor();
    await page.getByText('Current angpau total (RM)', { exact: true }).first().waitFor();
    page.on('dialog', dialog => dialog.accept());
    const moneyRow = page.locator('[data-guest-id="1"]');
    await moneyRow.getByLabel('Current angpau total (RM)', { exact: true }).fill('123.45');
    await moneyRow.getByRole('button', { name: 'Save total', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Save total', exact: true }).click();
    await page.getByText('Saved', { exact: true }).waitFor();
    assert.ok(amounts[1] === 123.45, 'Gift form must replace the current total exactly.');
    checks.push('Administrator decimal angpau total replacement');
    stage = 'relationship management';
    await page.getByRole('link', { name: 'Tags', exact: true }).click();
    await page.getByLabel('New tag name', { exact: true }).fill('Colleagues');
    await page.getByRole('button', { name: 'Add tag', exact: true }).click();
    await page.getByText('Colleagues', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Delete tag Friends', exact: true }).click();
    await page.getByText('This tag is in use. Reassign guests or tables before deleting it.', { exact: true }).waitFor();
    checks.push('Tag creation and referenced-tag error handling');
    stage = 'logout and staff account';
    const oldData = await page.evaluate(() => localStorage.getItem('wedding-react-v2'));
    assert.ok(oldData === 'preserved-legacy-backup-sentinel', 'API mode must preserve the browser dataset.');
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await page.getByRole('button', { name: 'Sign in', exact: true }).waitFor();
    currentRole = 'staff';
    const beforeStaff = moneyRequests;
    await page.getByLabel('Email', { exact: true }).fill(user.email);
    await page.getByLabel('Password', { exact: true }).fill('synthetic-test-password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.locator('[data-guest-id="1"]').waitFor();
    assert.ok(await page.getByRole('link', { name: 'Admin settings', exact: true }).count() === 0, 'Server staff role must hide admin navigation.');
    assert.ok(await page.getByRole('button', { name: 'Edit', exact: true }).count() === 0, 'Staff must not see edit controls.');
    assert.ok(moneyRequests === beforeStaff, 'Staff data loading must not request money.');
    failNextGuestFetch = true;
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await page.getByText('The API could not complete the request. Check backend configuration and try again.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await page.locator('[data-guest-id="1"]').waitFor();
    checks.push('Logout, server-controlled staff permissions, preserved local records, and API failure/retry');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Connected page must fit a mobile viewport.');
    assert.ok(errors.length === 0, 'Browser must not report runtime errors.');
  } finally { await browser.close(); }
})().catch(error => {
  // Error text may include request data, so only emit a sanitized category.
  console.error(`FAIL: frontend/backend browser integration at ${stage} (${error.name || 'Error'}). No credentials logged.`);
  process.exitCode = 1;
});
