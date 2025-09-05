import { test, expect } from '@playwright/test';

test.describe('Authentication Service Initialization Fix', () => {
  test('should properly initialize service when accessing board directly with stored auth', async ({ page }) => {
    console.log('Testing direct board access with stored authentication...');
    
    // Step 1: Set up authentication in localStorage
    const mockConnection = {
      organizationUrl: 'https://dev.azure.com/testorg',
      projectName: 'TestProject',
      accessToken: 'test-token'
    };
    
    await page.goto('http://localhost:4200');
    await page.evaluate((connection) => {
      localStorage.setItem('azureDevOpsConnection', JSON.stringify(connection));
    }, mockConnection);
    console.log('✓ Authentication set in localStorage');
    
    // Step 2: Access board directly (simulating direct URL access)
    await page.goto('http://localhost:4200/board');
    
    // Step 3: Wait for the page to load and check it doesn't get stuck spinning
    await page.waitForURL(/.*\/board/, { timeout: 10000 });
    console.log('✓ Successfully navigated to board');
    
    // Step 4: Wait for loading to complete (should not hang indefinitely)
    // The page should either show content or an error, but not spin forever
    await page.waitForFunction(() => {
      const loadingSpinner = document.querySelector('mat-progress-spinner');
      const errorMessage = document.querySelector('.error-message');
      const workItems = document.querySelector('.kanban-board, .work-item, mat-card');
      
      // Loading is considered complete if:
      // - No spinner is visible, OR
      // - There's an error message, OR  
      // - There are work items/content visible
      return !loadingSpinner || errorMessage || workItems;
    }, { timeout: 15000 });
    
    console.log('✓ Page finished loading (no infinite spinner)');
    
    // Step 5: Verify we're still on the board page (not redirected due to errors)
    expect(page.url()).toContain('/board');
    console.log('✓ Still on board page after loading');
    
    // Step 6: Check that the page has some content (not completely blank)
    const hasContent = await page.evaluate(() => {
      const body = document.body.textContent || '';
      return body.length > 100; // Page should have some meaningful content
    });
    
    expect(hasContent).toBe(true);
    console.log('✓ Page has content (not blank)');
    
    console.log('🎉 Service initialization fix test passed!');
  });
});