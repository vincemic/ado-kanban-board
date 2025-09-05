import { test, expect } from '@playwright/test';

test.describe('Work Item Dialog', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('azureDevOpsConnection', JSON.stringify({
        organizationUrl: 'https://dev.azure.com/testorg',
        projectName: 'TestProject',
        personalAccessToken: 'mock-token'
      }));
    });

    // Mock API responses for work item types and states
    await page.route('**/wit/workitemtypes**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          value: [
            { name: 'User Story', states: [{ name: 'New' }, { name: 'Active' }, { name: 'Resolved' }, { name: 'Closed' }] },
            { name: 'Bug', states: [{ name: 'New' }, { name: 'Active' }, { name: 'Resolved' }, { name: 'Closed' }] },
            { name: 'Task', states: [{ name: 'To Do' }, { name: 'In Progress' }, { name: 'Done' }] }
          ]
        })
      });
    });

    await page.route('**/wit/workitems**', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 123,
            fields: {
              'System.Title': 'New Test Item',
              'System.State': 'New',
              'System.WorkItemType': 'User Story'
            }
          })
        });
      } else {
        route.continue();
      }
    });
  });

  test('should open create work item dialog', async ({ page }) => {
    await page.goto('/kanban');
    
    // Click new work item button
    await page.click('button:has-text("New Work Item")');
    
    // Check dialog elements
    await expect(page.locator('mat-dialog-container')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Create Work Item');
    
    // Check form fields
    await expect(page.locator('input[formControlName="title"]')).toBeVisible();
    await expect(page.locator('mat-select[formControlName="workItemType"]')).toBeVisible();
    await expect(page.locator('mat-select[formControlName="state"]')).toBeVisible();
    await expect(page.locator('textarea[formControlName="description"]')).toBeVisible();
    await expect(page.locator('input[formControlName="tags"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/kanban');
    await page.click('button:has-text("New Work Item")');
    
    // Try to save without filling required fields
    await page.click('button:has-text("Save")');
    
    // Should show validation errors
    await expect(page.locator('mat-error')).toBeVisible();
  });

  test('should create work item with valid data', async ({ page }) => {
    await page.goto('/kanban');
    await page.click('button:has-text("New Work Item")');
    
    // Fill in the form
    await page.fill('input[formControlName="title"]', 'Test Work Item');
    
    // Select work item type
    await page.click('mat-select[formControlName="workItemType"]');
    await page.click('mat-option:has-text("User Story")');
    
    // Select state
    await page.click('mat-select[formControlName="state"]');
    await page.click('mat-option:has-text("New")');
    
    // Add description
    await page.fill('textarea[formControlName="description"]', 'This is a test work item description');
    
    // Add tags
    await page.fill('input[formControlName="tags"]', 'test, automation');
    
    // Save the work item
    await page.click('button:has-text("Save")');
    
    // Dialog should close
    await expect(page.locator('mat-dialog-container')).not.toBeVisible();
  });

  test('should cancel work item creation', async ({ page }) => {
    await page.goto('/kanban');
    await page.click('button:has-text("New Work Item")');
    
    // Fill in some data
    await page.fill('input[formControlName="title"]', 'Test Work Item');
    
    // Click cancel
    await page.click('button:has-text("Cancel")');
    
    // Dialog should close without saving
    await expect(page.locator('mat-dialog-container')).not.toBeVisible();
  });

  test('should handle work item type changes', async ({ page }) => {
    await page.goto('/kanban');
    await page.click('button:has-text("New Work Item")');
    
    // Select User Story
    await page.click('mat-select[formControlName="workItemType"]');
    await page.click('mat-option:has-text("User Story")');
    
    // States should update accordingly
    await page.click('mat-select[formControlName="state"]');
    await expect(page.locator('mat-option:has-text("New")')).toBeVisible();
    await expect(page.locator('mat-option:has-text("Active")')).toBeVisible();
    
    // Close state dropdown
    await page.keyboard.press('Escape');
    
    // Change to Task
    await page.click('mat-select[formControlName="workItemType"]');
    await page.click('mat-option:has-text("Task")');
    
    // States should update
    await page.click('mat-select[formControlName="state"]');
    await expect(page.locator('mat-option:has-text("To Do")')).toBeVisible();
    await expect(page.locator('mat-option:has-text("In Progress")')).toBeVisible();
  });
});