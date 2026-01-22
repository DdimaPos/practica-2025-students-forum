import { test, expect } from '@playwright/test';

test('on login page, email input works as expected', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveURL('/login');

  const loginEmailInput = page.getByTestId('login-email-input');
  const loginPasswordInput = page.getByTestId('login-password-input');
  await expect(loginEmailInput).toBeVisible();

  await loginEmailInput.fill('testuser@email.com');
  await expect(loginEmailInput).toHaveValue('testuser@email.com');

  await loginPasswordInput.fill('1234567890');
  await expect(loginPasswordInput).toHaveValue('1234567890');
});

test('clicking sign up redirects you to /register', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveURL('/login');

  const signUpLink = page.getByRole('link', { name: 'Sign up' });

  await signUpLink.click();
  await expect(page).toHaveURL('/register');
});

test('forgot password link redirects you to /forgot-password', async ({
  page,
}) => {
  await page.goto('/login');
  await expect(page).toHaveURL('/login');

  const forgotPasswordLink = page.getByRole('link', {
    name: 'Forgot your password?',
  });

  await forgotPasswordLink.click();
  await expect(page).toHaveURL('/forgot-password');
});

test('Oauth options visible on login', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveURL('/login');

  const oauthGroup = page.getByTestId('oauth-group');
  await expect(oauthGroup).toBeVisible();
});
