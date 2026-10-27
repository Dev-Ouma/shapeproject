import { defineConfig } from '@playwright/test';

const PORT = 4400;
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}`, channel: 'chrome', trace: 'retain-on-failure' },
  webServer: {
    command: `rm -rf var/e2e && mkdir -p var/e2e && node ./dist/server/entry.mjs`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      HOST: '127.0.0.1',
      PORT: String(PORT),
      DB_PATH: 'var/e2e/test.db',
      UPLOAD_DIR: 'var/e2e/uploads',
      BOOTSTRAP_ADMIN_EMAIL: 'admin@test.local',
      BOOTSTRAP_ADMIN_PASSWORD: 'Admin-pass-12345',
      BOOTSTRAP_ADMIN_NAME: 'Test Admin',
      SITE_URL: `http://127.0.0.1:${PORT}`,
      MAIL_CAPTURE: 'var/e2e/mail.jsonl',
    },
  },
});
