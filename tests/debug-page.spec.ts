import { test, expect } from '@playwright/test';

test('debug login flow', async ({ page }) => {
  console.log('Starting debug login test...');
  
  await page.goto('http://localhost:4200?mock=true');
  console.log('Page loaded');
  
  // Take initial screenshot
  await page.screenshot({ path: 'test-results/debug-01-initial.png' });
  
  // Wait for login form
  await page.waitForSelector('.login-card', { timeout: 10000 });
  console.log('Login form found');
  
  // Fill in the form
  await page.fill('input[formControlName="organizationName"]', 'mockorg');
  await page.fill('input[formControlName="accessToken"]', 'fake-token');
  
  await page.screenshot({ path: 'test-results/debug-02-form-filled.png' });
  
  // Submit form
  await page.click('button[type="submit"]');
  console.log('Form submitted');
  
  // Wait and take screenshot
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/debug-03-after-submit.png' });
  
  // Check what's on the page now
  const projectSelect = await page.locator('mat-select[formControlName="selectedProject"]').count();
  console.log('Project select found:', projectSelect);
  
  const errorMessage = await page.locator('.error-message').count();
  console.log('Error messages found:', errorMessage);
  
  const loginCards = await page.locator('.login-card').count();
  console.log('Login cards still visible:', loginCards);
  
  const kanbanContainer = await page.locator('.kanban-container').count();
  console.log('Kanban containers:', kanbanContainer);
  
  // Check for any visible text that might give us clues
  const pageText = await page.textContent('body');
  console.log('Page contains "project":', pageText?.includes('project'));
  console.log('Page contains "error":', pageText?.includes('error'));
  console.log('Page contains "loading":', pageText?.includes('Loading'));
  
  // Listen to console logs
  page.on('console', msg => console.log('Browser console:', msg.text()));
});