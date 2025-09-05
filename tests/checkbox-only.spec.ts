import { test, expect } from '@playwright/test';

test.describe('Remember Checkbox - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and navigate to login
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('checkbox should be visible and functional', async ({ page }) => {
    // Verify checkbox is visible
    const checkbox = page.locator('mat-checkbox[formControlName="rememberThis"]');
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toContainText('Remember this');
    
    // Verify checkbox is initially unchecked
    const checkboxInput = checkbox.locator('input[type="checkbox"]');
    await expect(checkboxInput).not.toBeChecked();
    
    // Click checkbox to check it
    await checkbox.click();
    await expect(checkboxInput).toBeChecked();
    
    // Click again to uncheck
    await checkbox.click();
    await expect(checkboxInput).not.toBeChecked();
  });

  test('checking remember saves credentials after successful login', async ({ page }) => {
    // Navigate with mock mode enabled
    await page.goto('/login?mock=true');
    
    // Fill form and check remember
    await page.fill('input[formControlName="organizationName"]', 'myorg');
    await page.fill('input[formControlName="accessToken"]', 'test-token');
    await page.locator('mat-checkbox[formControlName="rememberThis"]').click();
    
    // Complete login flow
    await page.click('button[type="submit"]');
    await expect(page.locator('mat-card-title')).toContainText('Select Project');
    await page.click('mat-select[formControlName="selectedProject"]');
    await page.click('mat-option:has-text("Sample Project")');
    await page.click('button:has-text("Connect")');
    
    // Verify credentials are saved
    const credentials = await page.evaluate(() => localStorage.getItem('adoKanbanCredentials'));
    expect(credentials).toBeTruthy();
    
    const parsed = JSON.parse(credentials!);
    expect(parsed.organizationName).toBe('myorg');
    expect(parsed.accessToken).toBe('test-token');
  });

  test('unchecking remember clears saved credentials', async ({ page }) => {
    // First save some credentials
    await page.evaluate(() => {
      localStorage.setItem('adoKanbanCredentials', JSON.stringify({
        organizationName: 'test-org',
        accessToken: 'test-token'
      }));
      localStorage.setItem('adoKanbanPreferences', JSON.stringify({
        rememberCredentials: true
      }));
    });
    
    // Reload to load saved credentials
    await page.reload();
    
    // Verify checkbox is checked
    const checkbox = page.locator('mat-checkbox[formControlName="rememberThis"] input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
    
    // Uncheck the checkbox
    await page.locator('mat-checkbox[formControlName="rememberThis"]').click();
    
    // Wait for the change to process
    await page.waitForTimeout(100);
    
    // Verify credentials are cleared
    const credentials = await page.evaluate(() => localStorage.getItem('adoKanbanCredentials'));
    expect(credentials).toBeNull();
  });
});