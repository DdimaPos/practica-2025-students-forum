import { test, expect } from '@playwright/test';

test('you can go to post creation page when authenticated', async ({
  page,
}) => {
  await page.goto('/posts/create-post');
  await expect(page).toHaveURL('/posts/create-post');
});
