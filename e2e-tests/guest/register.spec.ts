import { test, expect } from '@playwright/test';

test('on register page, email input works as expected', async ({ page }) => {
  await page.goto('/register');

  await expect(page).toHaveURL('/register');

  const registerEmailInput = page.getByTestId('register-email-input');
  const registerPasswordInput = page.getByTestId('register-password-input');
  await expect(registerEmailInput).toBeVisible();

  await registerEmailInput.fill('testuser@email.com');
  await expect(registerEmailInput).toHaveValue('testuser@email.com');

  await registerPasswordInput.fill('1234567890');
  await expect(registerPasswordInput).toHaveValue('1234567890');
});

test('clicking Log in redirects you to /login', async ({ page }) => {
  await page.goto('/register');
  await expect(page).toHaveURL('/register');

  const signUpLink = page.getByRole('link', { name: 'Log in' });

  await signUpLink.click();
  await expect(page).toHaveURL('/login');
});

test('Oauth options visible on register', async ({ page }) => {
  await page.goto('/register');
  await expect(page).toHaveURL('/register');

  const oauthGroup = page.getByTestId('oauth-group');
  await expect(oauthGroup).toBeVisible();
});

test('terms and conditions checkbox is visible', async ({ page }) => {
  await page.goto('/register');
  await expect(page).toHaveURL('/register');

  const checkbox = page.getByTestId('terms-and-conditions-checkbox');
  await expect(checkbox).toBeVisible();

  await checkbox.check();

  await expect(checkbox).toBeChecked();
});
