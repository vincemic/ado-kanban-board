import { test, expect } from '@playwright/test';

test('check login success with mock mode', async ({ page }) => {
  await page.goto('http://localhost:4200?mock=true');
  await page.waitForSelector('.login-card', { timeout: 10000 });
  
  await page.fill('input[formControlName="organizationName"]', 'mockorg');
  await page.fill('input[formControlName="accessToken"]', 'fake-token');
  
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // Check if project selection appeared (success) or error message (failure)
  const projectSelect = await page.locator('mat-select[formControlName="selectedProject"]').count();
  const errorMessage = await page.locator('.error-message').count();
  
  console.log('Project select found:', projectSelect);
  console.log('Error messages found:', errorMessage);
  
  if (projectSelect > 0) {
    console.log('SUCCESS: Project selection appeared - mock service is working!');
    
    // Continue with project selection
    await page.click('mat-select[formControlName="selectedProject"]');
    await page.waitForSelector('mat-option');
    
    const options = await page.locator('mat-option').count();
    console.log('Project options available:', options);
    
    if (options > 0) {
      await page.click('mat-option:first-child');
      await page.click('button[type="submit"]');
      
      // Wait for kanban board
      await page.waitForTimeout(3000);
      const kanbanBoard = await page.locator('.kanban-board').count();
      console.log('Kanban board loaded:', kanbanBoard > 0);
    }
  } else if (errorMessage > 0) {
    const errorText = await page.locator('.error-message').textContent();
    console.log('ERROR: Mock service not working. Error message:', errorText);
  } else {
    console.log('UNKNOWN: Neither project selection nor error message found');
  }
});