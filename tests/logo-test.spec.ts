import { test, expect } from '@playwright/test';

test.describe('Logo Display Test', () => {
  test('should display logo on login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check if logo element exists
    const logo = page.locator('img[alt="Azure DevOps Kanban Board"]');
    await expect(logo).toBeVisible();
    
    // Check if logo has correct src attribute
    await expect(logo).toHaveAttribute('src', '/logo.png');
    
    // Check if logo container exists
    const logoContainer = page.locator('.logo-container');
    await expect(logoContainer).toBeVisible();
    
    // Take a screenshot to see the logo
    await page.screenshot({ path: 'logo-test.png', fullPage: true });
    
    console.log('Logo test completed - screenshot saved as logo-test.png');
  });
  
  test('should load logo image successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for logo to load
    const logo = page.locator('img[alt="Azure DevOps Kanban Board"]');
    await expect(logo).toBeVisible();
    
    // Check if image loaded (natural width/height should be > 0)
    const imageLoaded = await logo.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0;
    });
    
    expect(imageLoaded).toBe(true);
    console.log('Logo loaded successfully!');
  });
});