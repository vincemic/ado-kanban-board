import { test, expect } from '@playwright/test';

test.describe('Team Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and enable mock mode
    await page.goto('http://localhost:4201');
    await page.waitForLoadState('networkidle');
    
    // Enable mock mode
    await page.locator('input[type="checkbox"]').check();
    
    // Fill in mock organization and project
    await page.fill('input[placeholder="Enter your organization name"]', 'mockorg');
    await page.fill('input[placeholder="Enter your project name"]', 'Sample Project');
    
    // Click login
    await page.click('button:has-text("Login")');
    
    // Wait for the kanban board to load
    await page.waitForSelector('.kanban-board');
  });

  test('should show team filter dropdown with teams', async ({ page }) => {
    // Check that team filter dropdown is present
    const teamFilter = page.locator('.team-filter mat-select');
    await expect(teamFilter).toBeVisible();
    
    // Click to open the dropdown
    await teamFilter.click();
    
    // Check for "All Teams" option and team options
    await expect(page.locator('mat-option:has-text("All Teams")')).toBeVisible();
    await expect(page.locator('mat-option:has-text("Frontend Team")')).toBeVisible();
    await expect(page.locator('mat-option:has-text("Backend Team")')).toBeVisible();
    await expect(page.locator('mat-option:has-text("DevOps Team")')).toBeVisible();
    await expect(page.locator('mat-option:has-text("QA Team")')).toBeVisible();
  });

  test('should filter work items by team', async ({ page }) => {
    // Initially, all work items should be visible
    const allWorkItems = page.locator('.work-item-card');
    const initialCount = await allWorkItems.count();
    expect(initialCount).toBeGreaterThan(0);
    
    // Open team filter dropdown
    await page.locator('.team-filter mat-select').click();
    
    // Select "Frontend Team"
    await page.locator('mat-option:has-text("Frontend Team")').click();
    
    // Wait for filtering to apply
    await page.waitForTimeout(500);
    
    // Check that only Frontend Team work items are visible
    const frontendWorkItems = page.locator('.work-item-card');
    const frontendCount = await frontendWorkItems.count();
    
    // Should be fewer items than before (filtered)
    expect(frontendCount).toBeLessThan(initialCount);
    
    // Check that visible work items have Frontend area paths
    const workItemCards = await frontendWorkItems.all();
    for (const card of workItemCards) {
      const areaPath = await card.locator('.team').textContent();
      expect(areaPath).toMatch(/Frontend|UI/);
    }
  });

  test('should filter work items by Backend Team', async ({ page }) => {
    // Open team filter dropdown
    await page.locator('.team-filter mat-select').click();
    
    // Select "Backend Team"
    await page.locator('mat-option:has-text("Backend Team")').click();
    
    // Wait for filtering to apply
    await page.waitForTimeout(500);
    
    // Check that only Backend Team work items are visible
    const backendWorkItems = page.locator('.work-item-card');
    const backendCount = await backendWorkItems.count();
    
    expect(backendCount).toBeGreaterThan(0);
    
    // Check that visible work items have Backend area paths
    const workItemCards = await backendWorkItems.all();
    for (const card of workItemCards) {
      const areaPath = await card.locator('.team').textContent();
      expect(areaPath).toMatch(/Backend|API/);
    }
  });

  test('should show all work items when "All Teams" is selected', async ({ page }) => {
    // First filter by a specific team
    await page.locator('.team-filter mat-select').click();
    await page.locator('mat-option:has-text("Frontend Team")').click();
    await page.waitForTimeout(500);
    
    const filteredCount = await page.locator('.work-item-card').count();
    
    // Now switch back to "All Teams"
    await page.locator('.team-filter mat-select').click();
    await page.locator('mat-option:has-text("All Teams")').click();
    await page.waitForTimeout(500);
    
    const allCount = await page.locator('.work-item-card').count();
    
    // Should show more items than when filtered
    expect(allCount).toBeGreaterThan(filteredCount);
  });

  test('should update item counts in column headers when filtering', async ({ page }) => {
    // Get initial item counts
    const initialNewCount = await page.locator('.kanban-column').first().locator('.item-count').textContent();
    
    // Filter by Frontend Team
    await page.locator('.team-filter mat-select').click();
    await page.locator('mat-option:has-text("Frontend Team")').click();
    await page.waitForTimeout(500);
    
    // Get filtered item counts
    const filteredNewCount = await page.locator('.kanban-column').first().locator('.item-count').textContent();
    
    // Item counts should be different (likely fewer)
    expect(filteredNewCount).not.toBe(initialNewCount);
  });
});