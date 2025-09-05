import { test, expect } from '@playwright/test';

test.describe('Application Navigation', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when accessing kanban without auth', async ({ page }) => {
    await page.goto('/kanban');
    await expect(page).toHaveURL('/login');
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
    
    // Check for proper labeling
    await expect(page.locator('label')).toHaveCount(3);
    
    // Check for form validation
    const orgUrlInput = page.locator('input[formControlName="organizationUrl"]');
    await expect(orgUrlInput).toHaveAttribute('required');
    
    const projectInput = page.locator('input[formControlName="projectName"]');
    await expect(projectInput).toHaveAttribute('required');
    
    const tokenInput = page.locator('input[formControlName="personalAccessToken"]');
    await expect(tokenInput).toHaveAttribute('required');
  });
});