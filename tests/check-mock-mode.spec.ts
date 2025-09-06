import { test, expect } from '@playwright/test';

test('check mock mode detection', async ({ page }) => {
  // Setup console log capture before page loads
  const logs: string[] = [];
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  await page.goto('http://localhost:4200?mock=true');
  await page.waitForTimeout(2000); // Wait for initialization
  
  console.log('\n=== Console Logs ===');
  logs.forEach(log => console.log(log));
  
  // Also check localStorage
  const useMockServices = await page.evaluate(() => {
    return localStorage.getItem('useMockServices');
  });
  
  console.log('\nLocalStorage useMockServices:', useMockServices);
  
  // Check URL params
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  console.log('URL contains mock=true:', currentUrl.includes('mock=true'));
});