import { test, expect } from '@playwright/test';

test('you try to login and then go to post creation page', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveURL('/login');

  const loginEmailInput = page.getByTestId('login-email-input');
  const loginPasswordInput = page.getByTestId('login-password-input');
  await expect(loginEmailInput).toBeVisible();

  // Change it with your user which exists in database
  // !!! All posts will be created in your project !!!
  await loginEmailInput.fill('testuser@email.com');
  await expect(loginEmailInput).toHaveValue('testuser@email.com');

  await loginPasswordInput.fill('1234567890');
  await expect(loginPasswordInput).toHaveValue('1234567890');

  const signInLink = page.getByRole('button', { name: 'Login' });
  await signInLink.click();

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });

  await page.goto('/posts/create-post');
  await expect(page).toHaveURL('/posts/create-post');
});
