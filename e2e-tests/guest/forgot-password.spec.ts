import test, { expect } from '@playwright/test';

test('email input works on /forgot-password page', async ({ page }) => {
  await page.goto('/forgot-password');
  await expect(page).toHaveURL('/forgot-password');

  const emailInput = page.getByTestId('email-input');

  await emailInput.fill('test@email.com');
  await expect(emailInput).toHaveValue('test@email.com');
});
