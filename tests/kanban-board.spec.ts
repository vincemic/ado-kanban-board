import { test, expect } from '@playwright/test';

// Mock authentication for kanban board tests
test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    // Mock localStorage to simulate authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('azureDevOpsConnection', JSON.stringify({
        organizationUrl: 'https://dev.azure.com/testorg',
        projectName: 'TestProject',
        personalAccessToken: 'mock-token'
      }));
    });
    
    // Mock API responses
    await page.route('**/wit/wiql**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          workItems: [
            { id: 1, url: 'mock-url-1' },
            { id: 2, url: 'mock-url-2' }
          ]
        })
      });
    });

    await page.route('**/wit/workitems**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          value: [
            {
              id: 1,
              fields: {
                'System.Title': 'Test Work Item 1',
                'System.State': 'New',
                'System.WorkItemType': 'User Story',
                'System.AssignedTo': { displayName: 'Test User' },
                'Microsoft.VSTS.Common.Priority': 2,
                'System.Tags': 'frontend;testing'
              }
            },
            {
              id: 2,
              fields: {
                'System.Title': 'Test Work Item 2',
                'System.State': 'Active',
                'System.WorkItemType': 'Bug',
                'System.AssignedTo': { displayName: 'Another User' },
                'Microsoft.VSTS.Common.Priority': 1,
                'System.Tags': 'backend'
              }
            }
          ]
        })
      });
    });
  });

  test('should display kanban board with columns', async ({ page }) => {
    await page.goto('/kanban');
    
    // Check for main kanban board elements
    await expect(page.locator('h1')).toContainText('Kanban Board');
    
    // Check for state columns
    await expect(page.locator('.state-column')).toHaveCount(4); // New, Active, Resolved, Closed
    
    // Check column headers
    await expect(page.locator('.column-header')).toContainText('New');
    await expect(page.locator('.column-header')).toContainText('Active');
    await expect(page.locator('.column-header')).toContainText('Resolved');
    await expect(page.locator('.column-header')).toContainText('Closed');
  });

  test('should display work items in correct columns', async ({ page }) => {
    await page.goto('/kanban');
    
    // Wait for work items to load
    await page.waitForSelector('.work-item-card');
    
    // Check that work items are displayed
    await expect(page.locator('.work-item-card')).toHaveCount(2);
    
    // Check work item content
    await expect(page.locator('.work-item-card')).toContainText('Test Work Item 1');
    await expect(page.locator('.work-item-card')).toContainText('Test Work Item 2');
  });

  test('should show new work item button', async ({ page }) => {
    await page.goto('/kanban');
    
    // Check for new work item button
    const newItemButton = page.locator('button').filter({ hasText: 'New Work Item' });
    await expect(newItemButton).toBeVisible();
  });

  test('should show refresh button', async ({ page }) => {
    await page.goto('/kanban');
    
    // Check for refresh button
    const refreshButton = page.locator('button[aria-label="Refresh"]');
    await expect(refreshButton).toBeVisible();
  });

  test('should open work item dialog when clicking new work item', async ({ page }) => {
    await page.goto('/kanban');
    
    // Click new work item button
    await page.click('button:has-text("New Work Item")');
    
    // Check that dialog opens
    await expect(page.locator('mat-dialog-container')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Create Work Item');
  });

  test('should show logout option', async ({ page }) => {
    await page.goto('/kanban');
    
    // Check for logout button or menu
    const logoutButton = page.locator('button').filter({ hasText: /logout|sign out/i });
    await expect(logoutButton).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.goto('/kanban');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Columns should still be visible but may stack differently
    await expect(page.locator('.state-column')).toBeVisible();
    
    // Buttons should remain accessible
    await expect(page.locator('button')).toBeVisible();
  });
});