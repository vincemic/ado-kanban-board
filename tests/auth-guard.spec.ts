import { test, expect } from '@playwright/test';

test.describe('Authentication Guard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear local storage to ensure clean state
    await page.goto('http://localhost:4200');
    await page.evaluate(() => localStorage.clear());
  });

  test('should redirect unauthenticated users to login page', async ({ page }) => {
    // Try to navigate directly to the board
    await page.goto('http://localhost:4200/board');
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('mat-card-subtitle')).toContainText('Enter your organization details to get started');
  });

  test('should redirect authenticated users to board when accessing login', async ({ page }) => {
    // Set up mock authentication in localStorage first
    const mockConnection = {
      organizationUrl: 'https://dev.azure.com/testorg',
      projectName: 'TestProject',
      accessToken: 'test-token'
    };
    
    await page.goto('http://localhost:4200');
    await page.evaluate((connection) => {
      localStorage.setItem('azureDevOpsConnection', JSON.stringify(connection));
    }, mockConnection);
    
    // Now try to access login page - should redirect to board
    await page.goto('http://localhost:4200/login');
    await expect(page).toHaveURL(/.*\/board/);
  });

  test('should allow access to board when authenticated', async ({ page }) => {
    // Set up mock authentication in localStorage
    const mockConnection = {
      organizationUrl: 'https://dev.azure.com/testorg',
      projectName: 'TestProject',
      accessToken: 'test-token'
    };
    
    await page.goto('http://localhost:4200');
    await page.evaluate((connection) => {
      localStorage.setItem('azureDevOpsConnection', JSON.stringify(connection));
    }, mockConnection);
    
    // Now try to access board
    await page.goto('http://localhost:4200/board');
    
    // Should be able to access board
    await expect(page).toHaveURL(/.*\/board/);
    await page.waitForLoadState('networkidle');
    // Check for kanban board elements instead of specific h1
    await expect(page.locator('.kanban-board, [data-testid="kanban-board"], mat-card')).toBeVisible();
  });

  test('should redirect to login after logout', async ({ page }) => {
    // Set up mock authentication
    const mockConnection = {
      organizationUrl: 'https://dev.azure.com/testorg',
      projectName: 'TestProject',
      accessToken: 'test-token'
    };
    
    await page.goto('http://localhost:4200');
    await page.evaluate((connection) => {
      localStorage.setItem('azureDevOpsConnection', JSON.stringify(connection));
    }, mockConnection);
    
    // Go to board
    await page.goto('http://localhost:4200/board');
    await expect(page).toHaveURL(/.*\/board/);
    
    // Logout
    await page.click('button:has-text("Logout")');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect root path based on authentication status', async ({ page }) => {
    // Test 1: Unauthenticated user should go to login
    await page.goto('http://localhost:4200');
    await expect(page).toHaveURL(/.*\/login/);
    
    // Test 2: Authenticated user should go to board
    const mockConnection = {
      organizationUrl: 'https://dev.azure.com/testorg',
      projectName: 'TestProject',
      accessToken: 'test-token'
    };
    
    await page.evaluate((connection) => {
      localStorage.setItem('azureDevOpsConnection', JSON.stringify(connection));
    }, mockConnection);
    
    await page.goto('http://localhost:4200');
    await expect(page).toHaveURL(/.*\/board/);
  });
});