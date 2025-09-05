import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to root which redirects to login page
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    // Check if we're redirected to the login page
    await expect(page).toHaveURL('/login');
    
    // Check for login form elements
    await expect(page.locator('input[formControlName="organizationName"]')).toBeVisible();
    await expect(page.locator('input[formControlName="accessToken"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Try to click submit button, but it should be disabled when form is empty
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should automatically enable mock mode with query parameter', async ({ page }) => {
    // Navigate with mock mode enabled via query parameter - directly to login page
    await page.goto('/login?mock=true');
    
    // Fill in any organization name and token (they will be ignored in mock mode)
    await page.fill('input[formControlName="organizationName"]', 'anyorg');
    await page.fill('input[formControlName="accessToken"]', 'test-token');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should proceed to project selection in mock mode
    await expect(page.locator('mat-card-title')).toContainText('Select Project');
    
    // Should show mock projects - check for specific project names
    await page.click('mat-select[formControlName="selectedProject"]');
    await expect(page.locator('mat-option').filter({ hasText: 'Sample Project' })).toBeVisible();
    await expect(page.locator('mat-option').filter({ hasText: 'Demo Project' })).toBeVisible();
    await expect(page.locator('mat-option').filter({ hasText: 'Test Project' })).toBeVisible();
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

  test('should complete mock login flow with query parameter', async ({ page }) => {
    // Navigate with mock mode enabled via query parameter - directly to login page
    await page.goto('/login?mock=true');
    
    // Fill in form with any organization name (mock mode ignores credentials)
    await page.fill('input[formControlName="organizationName"]', 'myorg');
    await page.fill('input[formControlName="accessToken"]', 'fake-token');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should proceed to project selection
    await expect(page.locator('mat-card-title')).toContainText('Select Project');
    
    // Should show mock projects
    await page.click('mat-select[formControlName="selectedProject"]');
    
    // Select a project
    await page.click('mat-option:has-text("Sample Project")');
    
    // Connect to project
    await page.click('button:has-text("Connect")');
    
    // Should navigate to kanban board
    await expect(page).toHaveURL(/\/board/);
  });

  test('should use production mode without query parameter', async ({ page }) => {
    // Fill in form with a regular organization name (no mock query parameter)
    await page.fill('input[formControlName="organizationName"]', 'mycompany');
    await page.fill('input[formControlName="accessToken"]', 'real-token');
    
    // Submit form - this should attempt to use real Azure DevOps service
    await page.click('button[type="submit"]');
    
    // In a real scenario, this would likely fail since we don't have a real token
    // We can check that the form submission happens (loading state)
    await expect(page.locator('button[type="submit"]')).toContainText('Loading Projects...');
  });
});