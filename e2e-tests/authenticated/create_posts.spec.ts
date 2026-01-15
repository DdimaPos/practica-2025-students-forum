import { test, expect } from '@playwright/test';

test('you can go to post creation page when authenticated', async ({
  page,
}) => {
  await page.goto('/posts/create-post');
  await expect(page).toHaveURL('/posts/create-post');
});

test('you can create a post when authenticated', async ({ page }) => {
  await page.goto('/posts/create-post');

  const postTitleInput = page.getByTestId('post-title-input').first();
  const postContentInput = page.getByTestId('post-content-input').first();
  await expect(postTitleInput).toBeVisible();
  await expect(postContentInput).toBeVisible();

  await postTitleInput.fill('Test Post Title');
  await expect(postTitleInput).toHaveValue('Test Post Title');

  await postContentInput.fill('This is test content for my post');
  await expect(postContentInput).toHaveValue(
    'This is test content for my post'
  );

  const submitButton = page.getByTestId('submit-post-button').first();

  await expect(submitButton).toBeVisible();
  await expect(submitButton).toHaveText('Publish Post');
});

test('you can switch to Create Poll tab', async ({ page }) => {
  await page.goto('/posts/create-post');

  const createPollTab = page
    .getByTestId('create-post-tab')
    .first()
    .locator('..')
    .getByText('Create Poll');
  await expect(createPollTab).toBeVisible();

  await createPollTab.click();

  await expect(page.getByTestId('post-title-input')).toBeHidden();
});

test('cannot submit post with empty fields', async ({ page }) => {
  await page.goto('/posts/create-post');

  const submitButton = page.getByTestId('submit-post-button').first();
  await submitButton.click();

  await expect(page.getByText('Title is required').first()).toBeVisible();
  await expect(page.getByText('Content is required').first()).toBeVisible();
});

test('cannot submit post with title containing only spaces', async ({
  page,
}) => {
  await page.goto('/posts/create-post');

  const postTitleInput = page.getByTestId('post-title-input').first();
  const postContentInput = page.getByTestId('post-content-input').first();

  await postTitleInput.fill('   ');
  await postContentInput.fill('Valid content');

  await page.getByTestId('submit-post-button').first().click();

  await expect(page.getByText('Title cannot be empty').first()).toBeVisible();
});

test('you can toggle anonymous post option', async ({ page }) => {
  await page.goto('/posts/create-post');

  const anonymousCheckbox = page.getByRole('checkbox').first();

  await expect(anonymousCheckbox).not.toBeChecked();
  await anonymousCheckbox.click();
  await expect(anonymousCheckbox).toBeChecked();

  await anonymousCheckbox.click();
  await expect(anonymousCheckbox).not.toBeChecked();
});
