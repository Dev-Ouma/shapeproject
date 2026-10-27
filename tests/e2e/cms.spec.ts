import { test, expect, type Page } from '@playwright/test';
import { totpAt, currentStep } from '../../src/lib/otp';

const ADMIN = { email: 'admin@test.local', password: 'Admin-pass-12345' };

// Authenticator state per account: secret + last step used (codes cannot be replayed).
const otpState = new Map<string, { secret: string; last: number }>();
const sessions = new Map<string, Awaited<ReturnType<ReturnType<Page['context']>['cookies']>>>();

async function nextCode(email: string, page: Page): Promise<string> {
  const st = otpState.get(email)!;
  for (;;) {
    const now = currentStep();
    const step = [now - 1, now, now + 1].find((s) => s > st.last);
    if (step !== undefined) { st.last = step; return totpAt(st.secret, step); }
    await page.waitForTimeout(1000);
  }
}

/** Complete the OTP step: enrol on first login (reads the manual key), else enter the next code. */
async function passOtp(page: Page, email: string) {
  await expect(page).toHaveURL(/\/admin\/otp/);
  const secretEl = page.locator('[data-secret]');
  if (await secretEl.count()) {
    otpState.set(email, { secret: (await secretEl.textContent())!.replace(/\s/g, ''), last: 0 });
    await page.fill('#code', await nextCode(email, page));
    await page.click('form:has(#code) button[type=submit]');
    await expect(page.getByRole('heading', { name: 'Two-step sign-in is on' })).toBeVisible();
    await page.getByRole('link', { name: /continue/ }).click();
  } else {
    await page.fill('#code', await nextCode(email, page));
    await page.click('form:has(#code) button[type=submit]');
  }
}

/** Sign in (password + OTP). Re-uses the session cookie of an earlier login for the same account. */
async function login(page: Page, email = ADMIN.email, password = ADMIN.password, fresh = false) {
  const cached = sessions.get(email);
  if (cached && !fresh) {
    await page.context().addCookies(cached);
    await page.goto('/admin');
    if (!/\/admin\/login/.test(page.url())) return;
  }
  await page.goto('/admin/login');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type=submit]');
  await passOtp(page, email);
  await expect(page).not.toHaveURL(/\/admin\/(login|otp)/);
  sessions.set(email, (await page.context().cookies()).filter((c) => c.name === 'shape_session'));
}

async function logout(page: Page) {
  await page.click('form[action="/admin/logout"] button');
  await expect(page).toHaveURL(/\/admin\/login/);
}

test.describe.configure({ mode: 'serial' });

test('public pages render without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const path of ['/', '/about/', '/partners/', '/project-team/', '/deliverables/', '/materials/', '/events/', '/project-book/', '/contact/', '/news/', '/news/shape-project-officially-launches/', '/category/news/', '/tag/kenya/', '/search/?s=mombasa']) {
    const r = await page.goto(path);
    expect(r?.status(), path).toBe(200);
  }
  expect(errors).toEqual([]);
  expect((await page.request.get('/does-not-exist/')).status()).toBe(404);
});

test('security headers are set', async ({ request }) => {
  const r = await request.get('/');
  expect(r.headers()['x-frame-options']).toBe('DENY');
  expect(r.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(r.headers()['x-content-type-options']).toBe('nosniff');
});

test('admin requires login and rejects wrong passwords', async ({ page }) => {
  await page.goto('/admin/content/posts');
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fcontent%2Fposts/);
  await page.fill('#email', ADMIN.email);
  await page.fill('#password', 'wrong-password-1');
  await page.click('button[type=submit]');
  await expect(page.getByRole('alert')).toHaveText('Incorrect email or password.');
  // Correct login returns to the requested page.
  await page.fill('#password', ADMIN.password);
  await page.click('button[type=submit]');
  // First sign-in: two-step setup is mandatory before any admin page opens.
  await expect(page.getByRole('heading', { name: 'Set up two-step sign-in' })).toBeVisible();
  await expect(page.locator('.a-qr svg')).toBeVisible();
  expect((await page.request.get('/admin/content/posts', { maxRedirects: 0 })).headers()['location']).toBe('/admin/otp');
  await page.fill('#code', '000000');
  await page.click('form:has(#code) button[type=submit]');
  await expect(page.getByRole('alert')).toContainText('did not match');
  await passOtp(page, ADMIN.email);
  await expect(page).toHaveURL(/\/admin\/content\/posts$/);
  await expect(page.getByRole('heading', { name: 'News posts' })).toBeVisible();
  sessions.set(ADMIN.email, (await page.context().cookies()).filter((c) => c.name === 'shape_session'));
});

test('second sign-in asks for the authenticator code and rejects reused codes', async ({ page }) => {
  await page.goto('/admin/login');
  await page.fill('#email', ADMIN.email);
  await page.fill('#password', ADMIN.password);
  await page.click('button[type=submit]');
  await expect(page.getByRole('heading', { name: 'Enter your verification code' })).toBeVisible();
  const st = otpState.get(ADMIN.email)!;
  await page.fill('#code', totpAt(st.secret, st.last)); // already used
  await page.click('form:has(#code) button[type=submit]');
  await expect(page.getByRole('alert')).toContainText('Invalid or already used code');
  await passOtp(page, ADMIN.email);
  await expect(page).toHaveURL(/\/admin$/);
});

test('password field has a show/hide toggle', async ({ page }) => {
  await page.goto('/admin/login');
  await page.fill('#password', 'secret-value-1');
  const toggle = page.getByRole('button', { name: 'Show password' });
  await toggle.click();
  await expect(page.locator('#password')).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Hide password' }).click();
  await expect(page.locator('#password')).toHaveAttribute('type', 'password');
});

test('login is locked after repeated failures', async ({ page }) => {
  for (let i = 0; i < 5; i++) {
    await page.goto('/admin/login');
    await page.fill('#email', 'nobody@test.local');
    await page.fill('#password', `bad-password-${i}`);
    await page.click('button[type=submit]');
  }
  await page.fill('#password', 'bad-password-x');
  await page.click('button[type=submit]');
  await expect(page.getByRole('alert')).toContainText('Too many attempts');
});

test('editing a hero slide updates the home page', async ({ page }) => {
  await login(page);
  await page.goto('/admin/content/slides');
  await page.getByRole('link', { name: 'Empowering Universities to Shape Smarter Cities' }).first().click();
  await page.fill('input[name="data[title]"]', 'Empowering Universities — E2E Edit');
  await page.click('button[value=save]');
  await expect(page.getByText('Saved. Changes are live on the site.')).toBeVisible();
  await page.goto('/');
  await expect(page.locator('.hero__slide.is-active h2')).toHaveAttribute('aria-label', 'Empowering Universities — E2E Edit');
  // Restore.
  await page.goto('/admin/content/slides');
  await page.getByRole('link', { name: 'Empowering Universities — E2E Edit' }).click();
  await page.fill('input[name="data[title]"]', 'Empowering Universities to Shape Smarter Cities');
  await page.click('button[value=save]');
});

test('validation errors are shown and nothing is saved', async ({ page }) => {
  await login(page);
  await page.goto('/admin/content/partners/new');
  await page.fill('input[name="data[name]"]', 'Incomplete University');
  await page.click('button[value=save]');
  await expect(page.getByText('Please fix the highlighted fields.')).toBeVisible();
  await expect(page.locator('.a-error').first()).toHaveText('Required');
  await page.goto('/partners/');
  await expect(page.getByText('Incomplete University')).toHaveCount(0);
});

test('news post: draft → preview → publish → visible → delete', async ({ page, browser }) => {
  await login(page);
  await page.goto('/admin/content/posts/new');
  await page.fill('input[name="data[title]"]', 'E2E Hackathon Announcement');
  await page.fill('textarea[name="data[excerpt]"]', 'Our first hackathon is coming.');
  await page.locator('[data-rte-body] .ProseMirror').click();
  await page.keyboard.type('The SHAPE consortium will host its first Open Innovation Hackathon.');
  await page.fill('input[name="data[tags]"]', 'Hackathon, Innovation');
  await page.click('button[value=draft]');
  await expect(page.getByText('Saved.')).toBeVisible();
  await expect(page.locator('.a-pill')).toHaveText('draft');

  // Anonymous visitors cannot see drafts.
  const anon = await browser.newPage();
  expect((await anon.goto('/news/e2e-hackathon-announcement/'))?.status()).toBe(404);

  // Editors can preview.
  await page.goto('/news/e2e-hackathon-announcement/');
  await expect(page.locator('.preview-bar')).toContainText('draft');

  // Publish.
  await page.goBack();
  await page.click('button[value=publish]');
  await expect(page.locator('.a-pill')).toHaveText('published');
  await anon.goto('/news/');
  await expect(anon.getByRole('link', { name: 'E2E Hackathon Announcement' })).toBeVisible();
  await anon.goto('/news/e2e-hackathon-announcement/');
  await expect(anon.locator('.page-content')).toContainText('first Open Innovation Hackathon');
  await expect(anon.getByRole('link', { name: 'Hackathon', exact: true })).toBeVisible();
  await anon.goto('/');
  await expect(anon.locator('.news-card h3').first()).toHaveText('E2E Hackathon Announcement');

  // Delete.
  page.once('dialog', (d) => d.accept());
  await page.click('button[value=delete]');
  await expect(page.getByText('Deleted.')).toBeVisible();
  expect((await anon.goto('/news/e2e-hackathon-announcement/'))?.status()).toBe(404);
  await anon.close();
});

test('media upload, type validation, and use on the team page', async ({ page }) => {
  await login(page);
  await page.goto('/admin/media');
  await page.setInputFiles('[data-files]', 'tests/fixtures/fake.png');
  await expect(page.locator('[data-upload-status]')).toContainText('Unsupported file type');
  await page.setInputFiles('[data-files]', 'tests/fixtures/photo.png');
  await expect(page.locator('.a-media-tile').first()).toBeVisible();
  await page.locator('.a-media-tile').first().click();
  const path = await page.locator('[data-copy-src]').inputValue();
  expect(path).toMatch(/^\/uploads\/\d{4}\/\d{2}\/photo-[a-f0-9]{6}\.png$/);
  expect((await page.request.get(path)).status()).toBe(200);

  // New team member with the uploaded photo, chosen through the picker.
  await page.goto('/admin/content/team/new');
  await page.fill('input[name="data[name]"]', 'Dr. Jane Wanjiru');
  await page.fill('input[name="data[title]"]', 'WP2 Researcher');
  await page.selectOption('select[name="data[institution]"]', 'Open University of Kenya');
  await page.click('[data-media-pick]');
  await page.locator('dialog .a-media-tile').first().click();
  await expect(page.locator('input[name="data[photo]"]')).toHaveValue(path);
  await page.click('button[value=save]');
  await expect(page.getByText('Saved.')).toBeVisible();

  await page.goto('/project-team/');
  const card = page.locator('.team-card', { hasText: 'Open University of Kenya' });
  await expect(card.locator('.team-card__members em')).toHaveText('1 team member');
  await expect(card.locator(`.team-card__members img[src="${path}"]`)).toHaveCount(1);

  // A file still in use cannot be deleted.
  await page.goto('/admin/media');
  await page.locator('.a-media-tile').first().click();
  page.once('dialog', (d) => d.accept());
  await page.click('button[value=delete]');
  await expect(page.getByRole('alert')).toContainText('still used');
});

test('publishing a deliverable document makes it downloadable on Materials', async ({ page }) => {
  await login(page);
  await page.goto('/admin/media');
  await page.setInputFiles('[data-files]', 'tests/fixtures/doc.pdf');
  await expect(page.locator('.a-media-tile', { hasText: 'doc.pdf' })).toBeVisible();
  await page.locator('.a-media-tile', { hasText: 'doc.pdf' }).click();
  const pdf = await page.locator('[data-copy-src]').inputValue();

  await page.goto('/admin/content/workpackages');
  await page.getByRole('link', { name: 'Establishing Design Requirements for Smart Cities in Sub-Saharan Africa' }).click();
  const item = page.locator('[data-repeater][data-name="data[deliverables]"] [data-item]').first();
  await item.locator('summary').click();
  await item.locator('input[name$="[file]"]').fill(pdf);
  await page.click('button[value=save]');
  await expect(page.getByText('Saved.')).toBeVisible();

  await page.goto('/materials/');
  const doc = page.locator('.doc-card', { hasText: 'D2.1' });
  await expect(doc.locator('a.dl-btn')).toHaveAttribute('href', pdf);
});

test('repeater: add, reorder and remove deliverables', async ({ page }) => {
  await login(page);
  await page.goto('/admin/content/workpackages');
  await page.getByRole('link', { name: 'Dissemination, Exploitation, Sustainability & Communication' }).click();
  const rep = page.locator('[data-repeater][data-name="data[deliverables]"]');
  await rep.locator('[data-add]').click();
  const added = rep.locator('[data-item]').last();
  await added.locator('input[name$="[code]"]').fill('D5.5');
  await added.locator('textarea[name$="[desc]"]').fill('Final conference report');
  await added.locator('[data-move="-1"]').click();
  await page.click('button[value=save]');
  await expect(page.getByText('Saved.')).toBeVisible();
  const codes = await page.locator('[data-repeater][data-name="data[deliverables]"] input[name$="[code]"]').evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value));
  expect(codes).toEqual(['D5.1', 'D5.2', 'D5.3', 'D5.5', 'D5.4']);
  await page.goto('/deliverables/');
  await expect(page.locator('.dl__row', { hasText: 'Final conference report' })).toBeVisible();

  // Remove it again.
  await page.goBack();
  const row = page.locator('[data-repeater][data-name="data[deliverables]"] [data-item]', { has: page.locator('input[value="D5.5"]') });
  page.once('dialog', (d) => d.accept());
  await row.locator('[data-remove]').click();
  await page.click('button[value=save]');
  await page.goto('/deliverables/');
  await expect(page.locator('.dl__row', { hasText: 'Final conference report' })).toHaveCount(0);
});

test('comments: visitor submits, admin approves, comment appears', async ({ page, browser }) => {
  const visitor = await browser.newPage();
  await visitor.goto('/news/shape-project-officially-launches/');
  await visitor.fill('#comment', 'Great news for East African universities!');
  await visitor.fill('#author', 'Amina Hassan');
  await visitor.fill('#email', 'amina@example.org');
  await visitor.click('#submit');
  await expect(visitor.getByRole('status')).toContainText('awaiting moderation');
  await expect(visitor.locator('.comments-list')).toHaveCount(0);

  await login(page);
  await expect(page.locator('.a-nav a', { hasText: 'Comments' }).locator('.a-badge')).toHaveText('1');
  await page.goto('/admin/comments');
  await expect(page.getByText('Great news for East African universities!')).toBeVisible();
  await page.click('button[value=approved]');
  await visitor.reload();
  await expect(visitor.locator('.comments-list')).toContainText('Amina Hassan');
  await expect(visitor.locator('.comments-list')).toContainText('Great news for East African universities!');
  await visitor.close();
});

test('contact form messages reach the admin inbox', async ({ page, browser }) => {
  const visitor = await browser.newPage();
  await visitor.goto('/contact/');
  await visitor.fill('input[name=name]', 'Peter Otieno');
  await visitor.fill('input[name=email]', 'peter@example.org');
  await visitor.fill('input[name=subject]', 'Partnership enquiry');
  await visitor.fill('textarea[name=message]', 'We would like to join as an associated partner.');
  await visitor.click('.contact__form button[type=submit]');
  await expect(visitor.getByRole('status')).toContainText('your message has been sent');
  await visitor.close();

  await login(page);
  await page.goto('/admin/messages');
  await page.getByRole('link', { name: /Partnership enquiry/ }).click();
  await expect(page.locator('.ibx__read')).toContainText('We would like to join as an associated partner.');
  // Replies are recorded in the thread (email is not configured in tests).
  await page.fill('#reply-body', 'Thank you, Peter. We will be in touch.');
  await page.click('.ibx__reply button[value=log]');
  await expect(page.locator('.ibx__msg--reply')).toContainText('Thank you, Peter.');
  await expect(page.locator('.ibx__msg--reply .ibx__status')).toHaveText('Recorded only');
  await page.click('button[value=star]');
  await expect(page.locator('button[value=star]')).toHaveAttribute('aria-pressed', 'true');
  await page.click('button[value=archive]');
  await expect(page.locator('.ibx__list')).not.toContainText('Partnership enquiry');
  await page.goto('/admin/messages?f=archived&q=Partnership');
  await expect(page.locator('.ibx__item')).toContainText('Replied');
  await page.goto('/admin');
  await expect(page.locator('.a-stat', { hasText: 'Unread messages' }).locator('strong')).toHaveText('0');
});

test('editor invite: accept, edit content, blocked from admin-only areas', async ({ page, browser }) => {
  await login(page);
  await page.goto('/admin/users');
  await page.fill('#iname', 'Edna Editor');
  await page.fill('#iemail', 'edna@test.local');
  await page.selectOption('#irole', 'editor');
  await page.click('form:has(#iname) button[type=submit]');
  const link = await page.locator('[data-invite]').inputValue();
  expect(link).toMatch(/\/admin\/invite\//);

  const editor = await browser.newPage();
  await editor.goto(link);
  await expect(editor.getByRole('heading', { name: 'Welcome, Edna Editor' })).toBeVisible();
  // Browser blocks < 12 chars; the server also rejects passwords without digits.
  await editor.fill('#password', 'onlylettershere');
  await editor.fill('#confirm', 'onlylettershere');
  await editor.click('button[type=submit]');
  await expect(editor.getByRole('alert')).toContainText('letters and numbers');
  await editor.fill('#password', 'Editor-pass-6789');
  await editor.fill('#confirm', 'Editor-pass-6789');
  await editor.click('button[type=submit]');
  await passOtp(editor, 'edna@test.local');
  await expect(editor).toHaveURL(/\/admin$/);
  await expect(editor.locator('.a-role').first()).toHaveText('editor');

  // Editors see content but not admin-only menu items.
  await expect(editor.locator('.a-nav a', { hasText: 'Users' })).toHaveCount(0);
  await expect(editor.locator('.a-nav a', { hasText: 'Site settings' })).toHaveCount(0);
  expect((await editor.goto('/admin/users'))?.status()).toBe(403);
  expect((await editor.goto('/admin/content/settings'))?.status()).toBe(403);
  expect((await editor.goto('/admin/content/events'))?.status()).toBe(200);

  // Invite link is single use.
  const again = await browser.newPage();
  expect((await again.goto(link))?.status()).toBe(404);
  await again.close();

  // Admin disables the editor → editor is signed out.
  await page.goto('/admin/users');
  await page.locator('tr', { hasText: 'edna@test.local' }).locator('button[value=disable]').click();
  await editor.goto('/admin');
  await expect(editor).toHaveURL(/\/admin\/login/);
  await editor.close();
});

test('managed redirects work', async ({ page }) => {
  await login(page);
  await page.goto('/admin/content/redirects/new');
  await page.fill('input[name="data[from]"]', '/old-hackathon-page');
  await page.fill('input[name="data[to]"]', '/events/');
  await page.click('button[value=save]');
  await expect(page.getByText('Saved.')).toBeVisible();
  const r = await page.request.get('/old-hackathon-page', { maxRedirects: 0 });
  expect(r.status()).toBe(301);
  expect(r.headers()['location']).toBe('/events/');
});

test('settings change contact details site-wide', async ({ page }) => {
  await login(page);
  await page.goto('/admin/content/settings');
  await page.fill('input[name="data[email]"]', 'not-an-email');
  await page.click('button[value=save]');
  await expect(page.locator('.a-error').first()).toHaveText('Invalid email');
  await page.fill('input[name="data[email]"]', 'info@shapeproject.test');
  await page.click('button[value=save]');
  await expect(page.getByText('Saved.')).toBeVisible();
  await page.goto('/contact/');
  await expect(page.locator('.topbar')).toContainText('info@shapeproject.test');
});

test('admin JSON API rejects cross-origin requests', async ({ page }) => {
  await login(page);
  const r = await page.request.post('/admin/api/reorder', { data: { collection: 'facts', ids: [1] }, headers: { Origin: 'https://evil.example' } });
  expect(r.status()).toBe(403);
});

test('logout ends the session', async ({ page }) => {
  await login(page);
  await page.goto('/admin');
  await logout(page);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
});
