import { test, expect } from '@playwright/test';

test('while being on homepage, clicking homepage link does not redirect the user to other page', async ({
  page,
}) => {
  await page.goto('/');

  const homeLink = page.getByRole('link', { name: 'Go to main' });
  await expect(homeLink).toBeVisible();
  await homeLink.click();

  await expect(page).toHaveURL('/');
});

// test('clicking on show more redirects you on leaderboards page', async ({
//   page,
// }) => {
//   await page.goto('/');
//
//   const leaderboardsLink = page.getByTestId('leaderboard-students-link');
//   await expect(leaderboardsLink).toBeVisible();
//   await leaderboardsLink.click();
//
//   await expect(page).toHaveURL('/leaderboards?tab');
// });
