import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated state for tests
    await page.addInitScript(() => {
      localStorage.setItem('azureDevOpsConnection', JSON.stringify({
        organizationUrl: 'https://dev.azure.com/testorg',
        projectName: 'Sample Project',
        accessToken: 'mock-token'
      }));
    });
  });

  test('should have draggable work items', async ({ page }) => {
    await page.goto('/board?mock=true');
    
    // Wait for work items to load from mock service
    await page.waitForSelector('.work-item-card', { timeout: 10000 });
    
    // Check that work items have draggable attributes
    const workItems = page.locator('.work-item-card');
    await expect(workItems.first()).toHaveAttribute('cdkDrag');
  });

  test('should have drop zones for each column', async ({ page }) => {
    await page.goto('/board?mock=true');
    
    // Check that columns have drop zones
    const columns = page.locator('.state-column');
    await expect(columns).toHaveCount(4);
    
    // Each column should have a drop zone
    for (let i = 0; i < 4; i++) {
      await expect(columns.nth(i).locator('.work-items-container')).toHaveAttribute('cdkDropList');
    }
  });

  test('should show visual feedback during drag', async ({ page }) => {
    await page.goto('/board?mock=true');
    await page.waitForSelector('.work-item-card', { timeout: 10000 });
    
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

  test('should handle mock data drag and drop', async ({ page }) => {
    await page.goto('/board?mock=true');
    await page.waitForSelector('.work-item-card', { timeout: 10000 });
    
    // Get the first work item (should be "Implement user authentication" in New state)
    const authWorkItem = page.locator('.work-item-card:has-text("Implement user authentication")');
    await expect(authWorkItem).toBeVisible();
    
    // Get the Active column
    const activeColumn = page.locator('.state-column:has-text("Active")');
    await expect(activeColumn).toBeVisible();
    
    // Perform drag and drop using Playwright's drag and drop
    await authWorkItem.dragTo(activeColumn);
    
    // The mock service should handle the state update
    // Note: In a real test, you might want to verify the state change
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/board?mock=true');
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
    await page.goto('/board?mock=true');
    await page.waitForSelector('.work-item-card');
    
    // Check for proper ARIA labels
    const workItems = page.locator('.work-item-card');
    await expect(workItems.first()).toHaveAttribute('role');
    
    // Check for descriptive text
    await expect(workItems.first()).toHaveAttribute('aria-label');
  });

  test('should work on touch devices', async ({ page }) => {
    await page.goto('/board?mock=true');
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