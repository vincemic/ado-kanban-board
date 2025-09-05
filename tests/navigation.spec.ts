import { test, expect } from '@playwright/test';

test.describe('Application Navigation', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when accessing board without auth', async ({ page }) => {
    await page.goto('/board');
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to board after successful authentication in mock mode', async ({ page }) => {
    // Navigate with mock mode enabled
    await page.goto('/login?mock=true');
    
    // Fill in form (any credentials work in mock mode)
    await page.fill('input[formControlName="organizationName"]', 'testorg');
    await page.fill('input[formControlName="accessToken"]', 'mock-token');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should proceed to project selection
    await expect(page.locator('mat-card-title')).toContainText('Select Project');
    
    // Select a project
    await page.click('mat-select[formControlName="selectedProject"]');
    await page.click('mat-option:has-text("Sample Project")');
    await page.click('button:has-text("Connect")');
    
    // Should navigate to board
    await expect(page).toHaveURL(/\/board/);
  });

  test('should maintain mock mode state across navigation', async ({ page }) => {
    // Set up authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('azureDevOpsConnection', JSON.stringify({
        organizationUrl: 'https://dev.azure.com/testorg',
        projectName: 'Sample Project',
        accessToken: 'mock-token'
      }));
    });

    // Navigate to board with mock mode
    await page.goto('/board?mock=true');
    await page.waitForSelector('.work-item-card', { timeout: 10000 });
    
    // Should see mock work items
    await expect(page.locator('.work-item-card:has-text("Implement user authentication")')).toBeVisible();
  });

  test('should show proper page titles', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Azure DevOps Kanban Board/);
  });

  test('should have responsive design elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check for Material Design elements
    await expect(page.locator('mat-card')).toBeVisible();
    await expect(page.locator('mat-form-field')).toBeVisible();
    
    // Test different viewport sizes
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('mat-card')).toBeVisible();
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('mat-card')).toBeVisible();
  });

  test('should have proper accessibility elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check for form inputs with proper attributes
    const orgNameInput = page.locator('input[formControlName="organizationName"]');
    await expect(orgNameInput).toHaveAttribute('required');
    
    const tokenInput = page.locator('input[formControlName="accessToken"]');
    await expect(tokenInput).toHaveAttribute('required');
  });
});