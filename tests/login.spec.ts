import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Enable mock mode for all tests
    await page.goto('/?mock=true');
  });

  test('should display login form', async ({ page }) => {
    // Check if we're redirected to login page or already there
    await expect(page).toHaveURL(/\/(login)?\?mock=true/);
    
    // Check for login form elements
    await expect(page.locator('mat-card-title')).toContainText('Connect to Azure DevOps');
    await expect(page.locator('input[formControlName="organizationName"]')).toBeVisible();
    await expect(page.locator('input[formControlName="accessToken"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Should show mock mode indicator
    await expect(page.locator('.service-mode')).toContainText('mock mode');
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Try to click submit button, but it should be disabled when form is empty
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should toggle between mock and real mode', async ({ page }) => {
    // Should start in mock mode
    await expect(page.locator('.service-mode')).toContainText('mock mode');
    
    // Click toggle button
    await page.click('button:has-text("Switch to Real Azure DevOps")');
    
    // Should switch to real mode
    await expect(page.locator('.service-mode')).toContainText('real mode');
    
    // Toggle back
    await page.click('button:has-text("Switch to Mock Mode")');
    await expect(page.locator('.service-mode')).toContainText('mock mode');
  });

  test('should validate organization name format', async ({ page }) => {
    // Fill in invalid organization name (with special characters)
    await page.fill('input[formControlName="organizationName"]', 'invalid@org!');
    await page.fill('input[formControlName="accessToken"]', 'test-token');
    
    // Form should be invalid due to organization name validation
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
    
    // Should show organization name validation error
    await expect(page.locator('mat-error')).toContainText('Please enter a valid organization name');
  });

  test('should accept valid organization name format', async ({ page }) => {
    // Fill in valid organization name
    await page.fill('input[formControlName="organizationName"]', 'myorg');
    await page.fill('input[formControlName="accessToken"]', 'test-token');
    
    // Form should be valid (submit button enabled)
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).not.toBeDisabled();
  });

  test('should complete mock login flow', async ({ page }) => {
    // Fill in form with any values (mock mode)
    await page.fill('input[formControlName="organizationName"]', 'testorg');
    await page.fill('input[formControlName="accessToken"]', 'fake-token');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should proceed to project selection
    await expect(page.locator('mat-card-title')).toContainText('Select Project');
    
    // Should show mock projects
    await page.click('mat-select[formControlName="selectedProject"]');
    await expect(page.locator('mat-option')).toContainText('Sample Project');
    await expect(page.locator('mat-option')).toContainText('Demo Project');
    await expect(page.locator('mat-option')).toContainText('Test Project');
    
    // Select a project
    await page.click('mat-option:has-text("Sample Project")');
    
    // Connect to project
    await page.click('button:has-text("Connect")');
    
    // Should navigate to kanban board
    await expect(page).toHaveURL(/\/board/);
  });
});