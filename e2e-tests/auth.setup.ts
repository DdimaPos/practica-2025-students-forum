import { test as setup } from '@playwright/test';
import 'dotenv/config';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  if (!process.env.E2E_TEST_USER_EMAIL || !process.env.E2E_TEST_USER_PASSWORD) {
    throw new Error(
      'Missing required environment variables: E2E_TEST_USER_EMAIL and/or E2E_TEST_USER_PASSWORD'
    );
  }
  await page.goto('/login');

  const loginEmailInput = page.getByTestId('login-email-input');
  const loginPasswordInput = page.getByTestId('login-password-input');

  await loginEmailInput.fill(process.env.E2E_TEST_USER_EMAIL || '');
  await loginPasswordInput.fill(process.env.E2E_TEST_USER_PASSWORD || '');

  const signInLink = page.getByRole('button', { name: 'Login' });
  await signInLink.click();

  await page.waitForURL(url => !url.pathname.includes('/login'), {
    timeout: 10000,
  });

  await page.context().storageState({ path: authFile });
});
