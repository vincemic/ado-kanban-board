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
    // Set up mock mode
    await page.addInitScript(() => {
      localStorage.setItem('useMockServices', 'true');
    });

    await page.goto('/login?mock=true');
    
    // Should show mock toggle as enabled
    await expect(page.locator('.mock-indicator:has-text("Mock Mode: ON")')).toBeVisible();
    
    // Fill in simplified form for mock mode
    await page.fill('input[formControlName="organizationName"]', 'testorg');
    await page.fill('input[formControlName="projectName"]', 'Sample Project');
    await page.fill('input[formControlName="personalAccessToken"]', 'mock-token');
    
    // Submit and check navigation
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/board');
  });

  test('should maintain mock mode state across navigation', async ({ page }) => {
    // Set up mock mode and authentication
    await page.addInitScript(() => {
      localStorage.setItem('useMockServices', 'true');
      localStorage.setItem('azureDevOpsConnection', JSON.stringify({
        organizationUrl: 'https://dev.azure.com/testorg',
        projectName: 'Sample Project',
        accessToken: 'mock-token'
      }));
    });

    await page.goto('/board?mock=true');
    await page.waitForSelector('.work-item-card', { timeout: 10000 });
    
    // Should see mock work items
    await expect(page.locator('.work-item-card:has-text("Implement user authentication")')).toBeVisible();
    
    // Navigate back to login and check mock mode is still enabled
    await page.goto('/login?mock=true');
    await expect(page.locator('.mock-indicator:has-text("Mock Mode: ON")')).toBeVisible();
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
    
    // Check for proper labeling - updated for new form structure
    await expect(page.locator('label')).toHaveCount(3);
    
    // Check for form validation - updated field names
    const orgNameInput = page.locator('input[formControlName="organizationName"]');
    await expect(orgNameInput).toHaveAttribute('required');
    
    const projectInput = page.locator('input[formControlName="projectName"]');
    await expect(projectInput).toHaveAttribute('required');
    
    const tokenInput = page.locator('input[formControlName="personalAccessToken"]');
    await expect(tokenInput).toHaveAttribute('required');
  });

  test('should toggle between mock and real modes', async ({ page }) => {
    await page.goto('/login');
    
    // Initially should be in real mode
    await expect(page.locator('.mock-indicator:has-text("Mock Mode: OFF")')).toBeVisible();
    
    // Toggle to mock mode
    await page.click('.mock-toggle-button');
    await expect(page.locator('.mock-indicator:has-text("Mock Mode: ON")')).toBeVisible();
    
    // Toggle back to real mode
    await page.click('.mock-toggle-button');
    await expect(page.locator('.mock-indicator:has-text("Mock Mode: OFF")')).toBeVisible();
  });
});