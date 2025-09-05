import { test, expect } from '@playwright/test';

test.describe('Remember Credentials Checkbox', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure clean state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('should display remember this checkbox', async ({ page }) => {
    // Navigate to login page
    await expect(page).toHaveURL('/login');
    
    // Check that the remember checkbox is visible
    const rememberCheckbox = page.locator('mat-checkbox[formControlName="rememberThis"]');
    await expect(rememberCheckbox).toBeVisible();
    
    // Check the checkbox label text
    await expect(rememberCheckbox).toContainText('Remember this');
    
    // Checkbox should be unchecked by default
    await expect(rememberCheckbox.locator('input[type="checkbox"]')).not.toBeChecked();
  });

  test('should allow checking and unchecking the remember checkbox', async ({ page }) => {
    const rememberCheckbox = page.locator('mat-checkbox[formControlName="rememberThis"]');
    const checkboxInput = rememberCheckbox.locator('input[type="checkbox"]');
    
    // Initially unchecked
    await expect(checkboxInput).not.toBeChecked();
    
    // Click to check
    await rememberCheckbox.click();
    await expect(checkboxInput).toBeChecked();
    
    // Click to uncheck
    await rememberCheckbox.click();
    await expect(checkboxInput).not.toBeChecked();
  });

  test('should save credentials to localStorage when remember is checked and login succeeds', async ({ page }) => {
    const organizationName = 'test-this';
    const accessToken = 'test-token';
    
    // Fill in credentials
    await page.fill('input[formControlName="organizationName"]', organizationName);
    await page.fill('input[formControlName="accessToken"]', accessToken);
    
    // Check the remember checkbox
    await page.locator('mat-checkbox[formControlName="rememberThis"]').click();
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for project selection to appear (indicates successful first step)
    await expect(page.locator('mat-card-title')).toContainText('Select Project');
    
    // Select a project and complete login
    await page.click('mat-select[formControlName="selectedProject"]');
    await page.click('mat-option:has-text("Sample Project")');
    await page.click('button:has-text("Connect")');
    
    // Wait for navigation to board
    await expect(page).toHaveURL(/\/board/);
    
    // Check that credentials were saved to localStorage
    const savedCredentials = await page.evaluate(() => {
      return localStorage.getItem('adoKanbanCredentials');
    });
    
    expect(savedCredentials).toBeTruthy();
    
    const parsedCredentials = JSON.parse(savedCredentials!);
    expect(parsedCredentials.organizationName).toBe(organizationName);
    expect(parsedCredentials.accessToken).toBe(accessToken);
    expect(parsedCredentials.projectName).toBe('Sample Project');
    
    // Check that preferences were saved
    const savedPreferences = await page.evaluate(() => {
      return localStorage.getItem('adoKanbanPreferences');
    });
    
    expect(savedPreferences).toBeTruthy();
    
    const parsedPreferences = JSON.parse(savedPreferences!);
    expect(parsedPreferences.rememberCredentials).toBe(true);
  });

  test('should NOT save credentials when remember is unchecked', async ({ page }) => {
    // Fill in credentials but don't check remember
    await page.fill('input[formControlName="organizationName"]', 'test-this');
    await page.fill('input[formControlName="accessToken"]', 'test-token');
    
    // Ensure remember checkbox is unchecked
    const checkboxInput = page.locator('mat-checkbox[formControlName="rememberThis"] input[type="checkbox"]');
    await expect(checkboxInput).not.toBeChecked();
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Complete login flow
    await expect(page.locator('mat-card-title')).toContainText('Select Project');
    await page.click('mat-select[formControlName="selectedProject"]');
    await page.click('mat-option:has-text("Sample Project")');
    await page.click('button:has-text("Connect")');
    
    // Wait for navigation to board
    await expect(page).toHaveURL(/\/board/);
    
    // Check that no credentials were saved to localStorage
    const savedCredentials = await page.evaluate(() => {
      return localStorage.getItem('adoKanbanCredentials');
    });
    
    expect(savedCredentials).toBeNull();
  });

  test('should load saved credentials on page refresh when remember is enabled', async ({ page }) => {
    // First, save some credentials manually to localStorage
    await page.evaluate(() => {
      const credentials = {
        organizationName: 'saved-org',
        accessToken: 'saved-token',
        projectName: 'Saved Project'
      };
      const preferences = {
        rememberCredentials: true
      };
      
      localStorage.setItem('adoKanbanCredentials', JSON.stringify(credentials));
      localStorage.setItem('adoKanbanPreferences', JSON.stringify(preferences));
    });
    
    // Refresh the page
    await page.reload();
    
    // Check that the form is pre-filled with saved credentials
    await expect(page.locator('input[formControlName="organizationName"]')).toHaveValue('saved-org');
    await expect(page.locator('input[formControlName="accessToken"]')).toHaveValue('saved-token');
    
    // Check that remember checkbox is checked
    await expect(page.locator('mat-checkbox[formControlName="rememberThis"] input[type="checkbox"]')).toBeChecked();
  });

  test('should clear credentials from localStorage when remember checkbox is unchecked', async ({ page }) => {
    // First, save some credentials to localStorage
    await page.evaluate(() => {
      const credentials = {
        organizationName: 'test-org',
        accessToken: 'test-token'
      };
      const preferences = {
        rememberCredentials: true
      };
      
      localStorage.setItem('adoKanbanCredentials', JSON.stringify(credentials));
      localStorage.setItem('adoKanbanPreferences', JSON.stringify(preferences));
    });
    
    // Refresh to load saved credentials
    await page.reload();
    
    // Verify credentials are loaded
    await expect(page.locator('input[formControlName="organizationName"]')).toHaveValue('test-org');
    await expect(page.locator('mat-checkbox[formControlName="rememberThis"] input[type="checkbox"]')).toBeChecked();
    
    // Uncheck the remember checkbox
    await page.locator('mat-checkbox[formControlName="rememberThis"]').click();
    
    // Wait a moment for the form change subscription to process
    await page.waitForTimeout(100);
    
    // Check that credentials were cleared from localStorage
    const savedCredentials = await page.evaluate(() => {
      return localStorage.getItem('adoKanbanCredentials');
    });
    
    expect(savedCredentials).toBeNull();
    
    // Check that preferences were updated
    const savedPreferences = await page.evaluate(() => {
      return localStorage.getItem('adoKanbanPreferences');
    });
    
    expect(savedPreferences).toBeTruthy();
    const parsedPreferences = JSON.parse(savedPreferences!);
    expect(parsedPreferences.rememberCredentials).toBe(false);
  });

  test('should not load credentials if remember preference is disabled', async ({ page }) => {
    // Save credentials but with remember disabled
    await page.evaluate(() => {
      const credentials = {
        organizationName: 'test-org',
        accessToken: 'test-token'
      };
      const preferences = {
        rememberCredentials: false
      };
      
      localStorage.setItem('adoKanbanCredentials', JSON.stringify(credentials));
      localStorage.setItem('adoKanbanPreferences', JSON.stringify(preferences));
    });
    
    // Refresh the page
    await page.reload();
    
    // Form should be empty since remember is disabled
    await expect(page.locator('input[formControlName="organizationName"]')).toHaveValue('');
    await expect(page.locator('input[formControlName="accessToken"]')).toHaveValue('');
    await expect(page.locator('mat-checkbox[formControlName="rememberThis"] input[type="checkbox"]')).not.toBeChecked();
  });

  test('should preserve remember checkbox state when going back from project selection', async ({ page }) => {
    // Fill form and check remember
    await page.fill('input[formControlName="organizationName"]', 'test-this');
    await page.fill('input[formControlName="accessToken"]', 'test-token');
    await page.locator('mat-checkbox[formControlName="rememberThis"]').click();
    
    // Submit to get to project selection
    await page.click('button[type="submit"]');
    await expect(page.locator('mat-card-title')).toContainText('Select Project');
    
    // Go back
    await page.click('button:has-text("Back")');
    
    // Check that remember checkbox is still checked
    await expect(page.locator('mat-checkbox[formControlName="rememberThis"] input[type="checkbox"]')).toBeChecked();
    
    // Form values should still be there
    await expect(page.locator('input[formControlName="organizationName"]')).toHaveValue('test-this');
    await expect(page.locator('input[formControlName="accessToken"]')).toHaveValue('test-token');
  });
});