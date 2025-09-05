import { test, expect } from '@playwright/test';

// Use mock authentication and data for kanban board tests
test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    // Enable mock mode and set up authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('useMockServices', 'true');
      localStorage.setItem('azureDevOpsConnection', JSON.stringify({
        organizationUrl: 'https://dev.azure.com/testorg',
        projectName: 'Sample Project',
        accessToken: 'mock-token'
      }));
    });
  });

  test('should display kanban board with columns', async ({ page }) => {
    await page.goto('/board?mock=true');
    
    // Wait for the board to load
    await page.waitForSelector('.kanban-board', { timeout: 10000 });
    
    // Check for main kanban board elements
    await expect(page.locator('h1')).toContainText('Kanban Board');
    
    // Check for state columns based on mock data states
    await expect(page.locator('.state-column')).toHaveCount(4); // New, Active, Resolved, Closed
    
    // Check column headers
    await expect(page.locator('.column-header')).toContainText('New');
    await expect(page.locator('.column-header')).toContainText('Active');
    await expect(page.locator('.column-header')).toContainText('Resolved');
    await expect(page.locator('.column-header')).toContainText('Closed');
  });

  test('should display mock work items in correct columns', async ({ page }) => {
    await page.goto('/board?mock=true');
    
    // Wait for work items to load from mock service
    await page.waitForSelector('.work-item-card', { timeout: 10000 });
    
    // Check that mock work items are displayed (7 items from MockAzureDevOpsService)
    await expect(page.locator('.work-item-card')).toHaveCount(7);
    
    // Check for specific mock work items
    await expect(page.locator('.work-item-card')).toContainText('Implement user authentication');
    await expect(page.locator('.work-item-card')).toContainText('Design database schema');
    await expect(page.locator('.work-item-card')).toContainText('Create REST API endpoints');
    await expect(page.locator('.work-item-card')).toContainText('Performance optimization');
  });

  test('should show work items with correct details', async ({ page }) => {
    await page.goto('/board?mock=true');
    await page.waitForSelector('.work-item-card', { timeout: 10000 });
    
    // Check work item details from mock data
    const authWorkItem = page.locator('.work-item-card:has-text("Implement user authentication")');
    await expect(authWorkItem).toContainText('John Doe');
    await expect(authWorkItem).toContainText('User Story');
    
    const dbWorkItem = page.locator('.work-item-card:has-text("Design database schema")');
    await expect(dbWorkItem).toContainText('Jane Smith');
    await expect(dbWorkItem).toContainText('Task');
  });

  test('should show new work item button', async ({ page }) => {
    await page.goto('/board?mock=true');
    
    // Check for new work item button
    const newItemButton = page.locator('button').filter({ hasText: 'New Work Item' });
    await expect(newItemButton).toBeVisible();
  });

  test('should show refresh button', async ({ page }) => {
    await page.goto('/board?mock=true');
    
    // Check for refresh button
    const refreshButton = page.locator('button[aria-label="Refresh"]');
    await expect(refreshButton).toBeVisible();
  });

  test('should open work item dialog when clicking new work item', async ({ page }) => {
    await page.goto('/board?mock=true');
    await page.waitForSelector('button:has-text("New Work Item")', { timeout: 10000 });
    
    // Click new work item button
    await page.click('button:has-text("New Work Item")');
    
    // Check that dialog opens
    await expect(page.locator('mat-dialog-container')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Create Work Item');
  });

  test('should show logout option', async ({ page }) => {
    await page.goto('/board?mock=true');
    
    // Check for logout button or menu
    const logoutButton = page.locator('button').filter({ hasText: /logout|sign out/i });
    await expect(logoutButton).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.goto('/board?mock=true');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Columns should still be visible but may stack differently
    await expect(page.locator('.state-column')).toBeVisible();
    
    // Buttons should remain accessible
    await expect(page.locator('button')).toBeVisible();
  });

  test('should handle mock data state changes', async ({ page }) => {
    await page.goto('/board?mock=true');
    await page.waitForSelector('.work-item-card', { timeout: 10000 });
    
    // Mock service should handle state updates
    const workItemCard = page.locator('.work-item-card').first();
    await expect(workItemCard).toBeVisible();
    
    // Verify work items are draggable (they should have the proper attributes)
    await expect(workItemCard).toHaveAttribute('cdkDrag');
  });
});