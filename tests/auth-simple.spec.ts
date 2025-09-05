import { test, expect } from '@playwright/test';

test.describe('Authentication Flow - Simple', () => {
  test('should redirect unauthenticated users from board to login', async ({ page }) => {
    // Clear local storage
    await page.goto('http://localhost:4200');
    await page.evaluate(() => localStorage.clear());
    
    // Try to access board directly
    await page.goto('http://localhost:4200/board');
    
    // Should be redirected to login
    await page.waitForURL(/.*\/login/);
    expect(page.url()).toContain('/login');
  });

  test('should allow authenticated users to access board', async ({ page }) => {
    // Set up authentication
    const mockConnection = {
      organizationUrl: 'https://dev.azure.com/testorg',
      projectName: 'TestProject',  
      accessToken: 'test-token'
    };
    
    await page.goto('http://localhost:4200');
    await page.evaluate((connection) => {
      localStorage.setItem('azureDevOpsConnection', JSON.stringify(connection));
    }, mockConnection);
    
    // Access board
    await page.goto('http://localhost:4200/board');
    
    // Should stay on board page
    await page.waitForURL(/.*\/board/);
    expect(page.url()).toContain('/board');
  });

  test('root should redirect based on auth status', async ({ page }) => {
    // Test unauthenticated redirect
    await page.goto('http://localhost:4200');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    await page.waitForURL(/.*\/login/);
    expect(page.url()).toContain('/login');
  });
});