import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/');
    
    // Check if we're redirected to login page
    await expect(page).toHaveURL('/login');
    
    // Check for login form elements
    await expect(page.locator('h1')).toContainText('Connect to Azure DevOps');
    await expect(page.locator('input[formControlName="organizationUrl"]')).toBeVisible();
    await expect(page.locator('input[formControlName="projectName"]')).toBeVisible();
    await expect(page.locator('input[formControlName="personalAccessToken"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');
    
    // Click submit without filling form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('mat-error')).toBeVisible();
  });

  test('should validate organization URL format', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid URL
    await page.fill('input[formControlName="organizationUrl"]', 'invalid-url');
    await page.fill('input[formControlName="projectName"]', 'test-project');
    await page.fill('input[formControlName="personalAccessToken"]', 'test-token');
    
    // Click submit
    await page.click('button[type="submit"]');
    
    // Should show URL validation error
    await expect(page.locator('mat-error')).toContainText('Please enter a valid Azure DevOps organization URL');
  });

  test('should accept valid organization URL format', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in valid URL format
    await page.fill('input[formControlName="organizationUrl"]', 'https://dev.azure.com/myorg');
    await page.fill('input[formControlName="projectName"]', 'test-project');
    await page.fill('input[formControlName="personalAccessToken"]', 'test-token');
    
    // Form should be valid (submit button enabled)
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).not.toBeDisabled();
  });
});