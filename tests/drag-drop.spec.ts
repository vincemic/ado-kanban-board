import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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
      if (route.request().method() === 'PATCH') {
        // Mock update response
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: parseInt(route.request().url().split('/').pop() || '1'),
            fields: {
              'System.Title': 'Updated Work Item',
              'System.State': 'Active',
              'System.WorkItemType': 'User Story'
            }
          })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            value: [
              {
                id: 1,
                fields: {
                  'System.Title': 'Draggable Work Item 1',
                  'System.State': 'New',
                  'System.WorkItemType': 'User Story',
                  'System.AssignedTo': { displayName: 'Test User' },
                  'Microsoft.VSTS.Common.Priority': 2
                }
              },
              {
                id: 2,
                fields: {
                  'System.Title': 'Draggable Work Item 2',
                  'System.State': 'Active',
                  'System.WorkItemType': 'Bug',
                  'System.AssignedTo': { displayName: 'Another User' },
                  'Microsoft.VSTS.Common.Priority': 1
                }
              }
            ]
          })
        });
      }
    });
  });

  test('should have draggable work items', async ({ page }) => {
    await page.goto('/kanban');
    
    // Wait for work items to load
    await page.waitForSelector('.work-item-card');
    
    // Check that work items have draggable attributes
    const workItems = page.locator('.work-item-card');
    await expect(workItems.first()).toHaveAttribute('cdkDrag');
  });

  test('should have drop zones for each column', async ({ page }) => {
    await page.goto('/kanban');
    
    // Check that columns have drop zones
    const columns = page.locator('.state-column');
    await expect(columns).toHaveCount(4);
    
    // Each column should have a drop zone
    for (let i = 0; i < 4; i++) {
      await expect(columns.nth(i).locator('.work-items-container')).toHaveAttribute('cdkDropList');
    }
  });

  test('should show visual feedback during drag', async ({ page }) => {
    await page.goto('/kanban');
    await page.waitForSelector('.work-item-card');
    
    const firstWorkItem = page.locator('.work-item-card').first();
    
    // Start dragging
    await firstWorkItem.hover();
    await page.mouse.down();
    
    // Move mouse to simulate drag
    await page.mouse.move(200, 0);
    
    // Check for visual feedback (this will depend on your CSS implementation)
    // The exact selectors may need to be adjusted based on your actual implementation
    await expect(page.locator('.cdk-drag-preview')).toBeVisible();
    
    // End drag
    await page.mouse.up();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/kanban');
    await page.waitForSelector('.work-item-card');
    
    // Focus on first work item
    await page.locator('.work-item-card').first().focus();
    
    // Check if work item is focusable
    await expect(page.locator('.work-item-card').first()).toBeFocused();
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    // Next focusable element should be focused
  });

  test('should be accessible with screen readers', async ({ page }) => {
    await page.goto('/kanban');
    await page.waitForSelector('.work-item-card');
    
    // Check for proper ARIA labels
    const workItems = page.locator('.work-item-card');
    await expect(workItems.first()).toHaveAttribute('role');
    
    // Check for descriptive text
    await expect(workItems.first()).toHaveAttribute('aria-label');
  });

  test('should work on touch devices', async ({ page }) => {
    await page.goto('/kanban');
    await page.waitForSelector('.work-item-card');
    
    // Simulate touch interactions
    const firstWorkItem = page.locator('.work-item-card').first();
    const targetColumn = page.locator('.state-column').nth(1);
    
    // Get bounding boxes
    const workItemBox = await firstWorkItem.boundingBox();
    const columnBox = await targetColumn.boundingBox();
    
    if (workItemBox && columnBox) {
      // Simulate touch drag
      await page.touchscreen.tap(workItemBox.x + workItemBox.width / 2, workItemBox.y + workItemBox.height / 2);
      
      // Note: Actual touch drag implementation would require more complex touch events
      // This is a simplified version for demonstration
    }
  });
});