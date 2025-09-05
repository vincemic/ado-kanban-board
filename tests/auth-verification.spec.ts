import { test, expect } from '@playwright/test';

test.describe('Authentication Guard Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:4200');
    await page.evaluate(() => localStorage.clear());
  });

  test('basic auth flow verification', async ({ page }) => {
    console.log('Testing basic authentication flow...');
    
    // Step 1: Verify unauthenticated user gets redirected to login
    await page.goto('http://localhost:4200/board');
    await page.waitForURL(/.*\/login/, { timeout: 10000 });
    console.log('✓ Unauthenticated user redirected to login');
    
    // Step 2: Verify login page is accessible
    expect(page.url()).toContain('/login');
    console.log('✓ Login page accessible');
    
    // Step 3: Simulate authentication by setting localStorage
    const mockConnection = {
      organizationUrl: 'https://dev.azure.com/testorg',
      projectName: 'TestProject',
      accessToken: 'test-token'
    };
    
    await page.evaluate((connection) => {
      localStorage.setItem('azureDevOpsConnection', JSON.stringify(connection));
    }, mockConnection);
    console.log('✓ Mock authentication set');
    
    // Step 4: Verify authenticated user can access board
    await page.goto('http://localhost:4200/board');
    await page.waitForURL(/.*\/board/, { timeout: 10000 });
    expect(page.url()).toContain('/board');
    console.log('✓ Authenticated user can access board');
    
    // Step 5: Verify authenticated user gets redirected from login to board
    await page.goto('http://localhost:4200/login');
    await page.waitForURL(/.*\/board/, { timeout: 10000 });
    expect(page.url()).toContain('/board');
    console.log('✓ Authenticated user redirected from login to board');
    
    console.log('🎉 All authentication guard tests passed!');
  });
});