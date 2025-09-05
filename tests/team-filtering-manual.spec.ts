import { test, expect } from '@playwright/test';

test.describe('Team Filtering - Manual Test', () => {
  test('basic team filtering functionality', async ({ page }) => {
    // Navigate directly to the running app with mock mode enabled
    await page.goto('http://localhost:4200?mock=true');

    console.log('Page loaded, checking for login form...');

    // Wait for login form to load
    await page.waitForSelector('.login-card', { timeout: 10000 });

    // Fill in the login form (mock mode still requires this step)
    await page.fill('input[formControlName="organizationName"]', 'mockorg');
    await page.fill('input[formControlName="accessToken"]', 'fake-token');

    // Submit the first form
    await page.click('button[type="submit"]');

    console.log('First form submitted, waiting for project selection...');

    // Wait for project selection to appear
    await page.waitForSelector('mat-select[formControlName="selectedProject"]', { timeout: 10000 });

    // Select a project from the dropdown
    await page.click('mat-select[formControlName="selectedProject"]');
    await page.waitForSelector('mat-option');
    await page.click('mat-option'); // Click first available option

    // Submit the project form
    await page.click('button[type="submit"]');

    console.log('Project form submitted, waiting for kanban board...');

    // Wait for the kanban board to load
    await page.waitForSelector('.kanban-board', { timeout: 10000 });

    // Wait for work items to load
    await page.waitForSelector('.work-item-card', { timeout: 5000 });

    console.log('Kanban board loaded, checking for team filter dropdown...');

    // Look for the team filter dropdown
    const teamFilter = page.locator('.team-filter mat-select');
    await expect(teamFilter).toBeVisible();

    console.log('Team filter dropdown found');

    // Click to open the dropdown
    await teamFilter.click();

    // Wait for dropdown options to appear
    await page.waitForSelector('mat-option');
    
    // Check that we have the expected teams in the dropdown
    const allTeamsOption = page.locator('mat-option:has-text("All Teams")');
    const frontendTeamOption = page.locator('mat-option:has-text("Frontend Team")');
    const backendTeamOption = page.locator('mat-option:has-text("Backend Team")');
    
    await expect(allTeamsOption).toBeVisible();
    await expect(frontendTeamOption).toBeVisible();
    await expect(backendTeamOption).toBeVisible();

    console.log('All expected teams found in dropdown');

    // Test filtering by Frontend Team
    await frontendTeamOption.click();
    
    // Wait for the filter to apply
    await page.waitForTimeout(1000);

    // Check that only Frontend team work items are visible
    const visibleCards = page.locator('.work-item-card');
    const cardCount = await visibleCards.count();
    
    console.log(`After filtering by Frontend Team, ${cardCount} cards are visible`);

    // Verify that all visible cards belong to Frontend team (have area path containing Frontend)
    if (cardCount > 0) {
      const workItems = await visibleCards.all();
      for (let i = 0; i < workItems.length; i++) {
        const teamText = await workItems[i].locator('.team').textContent();
        console.log(`Work item ${i + 1} team: ${teamText}`);
        expect(teamText).toMatch(/Frontend|UI/);
      }
    }

    // Test filtering by Backend Team
    await teamFilter.click();
    await backendTeamOption.click();
    await page.waitForTimeout(1000);

    const backendCards = page.locator('.work-item-card');
    const backendCount = await backendCards.count();
    
    console.log(`After filtering by Backend Team, ${backendCount} cards are visible`);

    // Verify that all visible cards belong to Backend team
    if (backendCount > 0) {
      const backendItems = await backendCards.all();
      for (let i = 0; i < backendItems.length; i++) {
        const teamText = await backendItems[i].locator('.team').textContent();
        console.log(`Backend work item ${i + 1} team: ${teamText}`);
        expect(teamText).toMatch(/Backend|API/);
      }
    }

    // Test returning to "All Teams"
    await teamFilter.click();
    await allTeamsOption.click();
    await page.waitForTimeout(1000);

    const allCards = page.locator('.work-item-card');
    const allCount = await allCards.count();
    
    console.log(`After selecting All Teams, ${allCount} cards are visible`);

    // Should have more or equal cards than any single team
    expect(allCount).toBeGreaterThanOrEqual(backendCount);
    expect(allCount).toBeGreaterThanOrEqual(cardCount);

    console.log('Team filtering test completed successfully!');
  });
});