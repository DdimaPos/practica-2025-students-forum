import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');

  const loginEmailInput = page.getByTestId('login-email-input');
  const loginPasswordInput = page.getByTestId('login-password-input');

  await loginEmailInput.fill('testuser@email.com');
  await loginPasswordInput.fill('1234567890');

  const signInLink = page.getByRole('button', { name: 'Login' });
  await signInLink.click();

  await page.waitForURL(url => !url.pathname.includes('/login'), {
    timeout: 10000,
  });

  await page.context().storageState({ path: authFile });
});
