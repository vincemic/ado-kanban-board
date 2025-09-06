import { test, expect } from '@playwright/test';

test('check error message', async ({ page }) => {
  await page.goto('http://localhost:4200?mock=true');
  await page.waitForSelector('.login-card', { timeout: 10000 });
  
  await page.fill('input[formControlName="organizationName"]', 'mockorg');
  await page.fill('input[formControlName="accessToken"]', 'fake-token');
  
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // Check for error message
  const errorMessage = await page.locator('.error-message').textContent();
  console.log('Error message:', errorMessage);
  
  // Check console logs
  const logs: string[] = [];
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  await page.waitForTimeout(1000);
  
  console.log('Console logs:');
  logs.forEach(log => console.log(log));
});