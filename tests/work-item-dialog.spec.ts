import { test, expect } from '@playwright/test';

test.describe('Work Item Dialog', () => {
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

  test('should open create work item dialog', async ({ page }) => {
    await page.goto('/board?mock=true');
    
    // Wait for page to load and new work item button to appear
    await page.waitForSelector('button:has-text("New Work Item")', { timeout: 10000 });
    
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
    await page.goto('/board?mock=true');
    await page.waitForSelector('button:has-text("New Work Item")', { timeout: 10000 });
    await page.click('button:has-text("New Work Item")');
    
    // Try to save without filling required fields
    await page.click('button:has-text("Save")');
    
    // Should show validation errors
    await expect(page.locator('mat-error')).toBeVisible();
  });

  test('should create work item with valid data using mock service', async ({ page }) => {
    await page.goto('/board?mock=true');
    await page.waitForSelector('button:has-text("New Work Item")', { timeout: 10000 });
    await page.click('button:has-text("New Work Item")');
    
    // Fill in the form
    await page.fill('input[formControlName="title"]', 'New Test Work Item from Playwright');
    
    // Select work item type
    await page.click('mat-select[formControlName="workItemType"]');
    await page.click('mat-option:has-text("User Story")');
    
    // Select state
    await page.click('mat-select[formControlName="state"]');
    await page.click('mat-option:has-text("New")');
    
    // Add description
    await page.fill('textarea[formControlName="description"]', 'This is a test work item created by Playwright using mock service');
    
    // Add tags
    await page.fill('input[formControlName="tags"]', 'test, automation, playwright');
    
    // Save the work item
    await page.click('button:has-text("Save")');
    
    // Dialog should close
    await expect(page.locator('mat-dialog-container')).not.toBeVisible();
    
    // Check that the new work item appears on the board
    await expect(page.locator('.work-item-card:has-text("New Test Work Item from Playwright")')).toBeVisible();
  });

  test('should cancel work item creation', async ({ page }) => {
    await page.goto('/board?mock=true');
    await page.waitForSelector('button:has-text("New Work Item")', { timeout: 10000 });
    await page.click('button:has-text("New Work Item")');
    
    // Fill in some data
    await page.fill('input[formControlName="title"]', 'This should not be saved');
    
    // Click cancel
    await page.click('button:has-text("Cancel")');
    
    // Dialog should close without saving
    await expect(page.locator('mat-dialog-container')).not.toBeVisible();
    
    // Check that no new work item was created
    await expect(page.locator('.work-item-card:has-text("This should not be saved")')).not.toBeVisible();
  });

  test('should handle work item type changes with mock data', async ({ page }) => {
    await page.goto('/board?mock=true');
    await page.waitForSelector('button:has-text("New Work Item")', { timeout: 10000 });
    await page.click('button:has-text("New Work Item")');
    
    // Select User Story
    await page.click('mat-select[formControlName="workItemType"]');
    await page.click('mat-option:has-text("User Story")');
    
    // States should update accordingly (mock service provides standard states)
    await page.click('mat-select[formControlName="state"]');
    await expect(page.locator('mat-option:has-text("New")')).toBeVisible();
    await expect(page.locator('mat-option:has-text("Active")')).toBeVisible();
    
    // Close state dropdown
    await page.keyboard.press('Escape');
    
    // Change to Bug
    await page.click('mat-select[formControlName="workItemType"]');
    await page.click('mat-option:has-text("Bug")');
    
    // States should update for Bug type
    await page.click('mat-select[formControlName="state"]');
    await expect(page.locator('mat-option:has-text("New")')).toBeVisible();
    await expect(page.locator('mat-option:has-text("Active")')).toBeVisible();
  });
});