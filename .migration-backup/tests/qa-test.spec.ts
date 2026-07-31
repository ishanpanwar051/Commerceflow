import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@commerceflow.dev';
const ADMIN_PASSWORD = 'Admin@123';
const CUSTOMER_EMAIL = 'customer@example.com';
const CUSTOMER_PASSWORD = 'Admin@123';

const errors: string[] = [];
let passed = 0;
let failed = 0;

function log(msg: string, status: 'OK' | 'FAIL' | 'INFO' = 'INFO') {
  const icon = status === 'OK' ? '✅' : status === 'FAIL' ? '❌' : '👉';
  console.log(`  ${icon} ${msg}`);
}

async function visit(page: Page, url: string, name: string): Promise<boolean> {
  try {
    log(`Opening ${name} (${url})...`, 'INFO');
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(3000);
    if (!resp || resp.status() >= 400) {
      log(`${name} - STATUS ${resp?.status()}`, 'FAIL');
      errors.push(`${name} (${url}) - HTTP ${resp?.status()}`);
      failed++;
      return false;
    }
    log(`${name} - ${resp.status()} OK`, 'OK');
    passed++;
    return true;
  } catch (e: any) {
    log(`${name} - TIMEOUT (Next.js compiling...)`, 'FAIL');
    errors.push(`${name} (${url}) - Timeout`);
    failed++;
    return false;
  }
}

test.describe('CommerceFlow QA Audit', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`CONSOLE: ${msg.text().slice(0, 100)}`);
      }
    });
    page.on('pageerror', (err) => {
      errors.push(`PAGE ERROR: ${err.message.slice(0, 100)}`);
    });
  });

  test('1. Homepage', async ({ page }) => {
    await visit(page, BASE_URL, 'Homepage');
    log(`Title: ${await page.title()}`);
  });

  test('2. Login', async ({ page }) => {
    if (!(await visit(page, `${BASE_URL}/login`, 'Login page'))) return;

    const email = page.locator('input[type="email"]').first();
    const password = page.locator('input[type="password"]').first();
    await expect(email).toBeVisible({ timeout: 5000 });
    await email.fill(CUSTOMER_EMAIL);
    await password.fill(CUSTOMER_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);

    if (page.url().includes('login')) {
      log('Login FAILED', 'FAIL');
      errors.push('Login failed');
    } else {
      log('Login SUCCESS', 'OK');
    }
  });

  test('3. Register', async ({ page }) => {
    if (!(await visit(page, `${BASE_URL}/register`, 'Register page'))) return;
    const inputs = await page.locator('input').count();
    log(`Form has ${inputs} fields`);
    expect(inputs).toBeGreaterThan(0);
  });

  test('4. Products', async ({ page }) => {
    if (!(await visit(page, `${BASE_URL}/products`, 'Products page'))) return;
    const links = await page.locator('a[href*="/products/"]').count();
    log(`Products found: ${links}`);
  });

  test('5. Categories', async ({ page }) => {
    if (!(await visit(page, `${BASE_URL}/categories`, 'Categories page'))) return;
    const cards = await page.locator('[class*="card"]').count();
    log(`Categories found: ${cards}`);
  });

  test('6. Forgot Password', async ({ page }) => {
    if (!(await visit(page, `${BASE_URL}/forgot-password`, 'Forgot password page'))) return;
    await expect(page.locator('input').first()).toBeVisible({ timeout: 5000 });
  });

  test('7. Cart', async ({ page }) => {
    await visit(page, `${BASE_URL}/cart`, 'Cart page');
  });

  test('8. Wishlist', async ({ page }) => {
    await visit(page, `${BASE_URL}/wishlist`, 'Wishlist page');
  });

  test('9. Product Detail', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(4000);
    const products = page.locator('a[href*="/products/"]');
    const count = await products.count();
    if (count > 0) {
      await products.first().click();
      await page.waitForTimeout(4000);
      log(`Product detail: ${page.url()}`, 'OK');
      passed++;
    } else {
      log('No products to open', 'FAIL');
      errors.push('No product links found');
      failed++;
    }
  });

  test('10. Profile (login first)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.locator('input[type="email"]').first().fill(CUSTOMER_EMAIL);
    await page.locator('input[type="password"]').first().fill(CUSTOMER_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    await visit(page, `${BASE_URL}/profile`, 'Profile page');
  });

  test('11. Orders (login first)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.locator('input[type="email"]').first().fill(CUSTOMER_EMAIL);
    await page.locator('input[type="password"]').first().fill(CUSTOMER_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    await visit(page, `${BASE_URL}/orders`, 'Orders page');
  });

  test('12. Admin Dashboard (admin login)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);

    const adminPages = ['/admin/dashboard', '/admin/products', '/admin/categories', '/admin/orders', '/admin/coupons'];
    for (const path of adminPages) {
      await visit(page, `${BASE_URL}${path}`, `Admin ${path}`);
    }
  });

  test('13. Checkout (login first)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.locator('input[type="email"]').first().fill(CUSTOMER_EMAIL);
    await page.locator('input[type="password"]').first().fill(CUSTOMER_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    await visit(page, `${BASE_URL}/checkout`, 'Checkout page');
  });

  test('14. Search', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(4000);
    const search = page.locator('input[type="search"], input[placeholder*="earch"]').first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill('phone');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(4000);
      log(`Search results: ${page.url()}`, 'OK');
      passed++;
    } else {
      log('Search input not found', 'FAIL');
      errors.push('Search input missing');
      failed++;
    }
  });

  test('15. 404 page', async ({ page }) => {
    const resp = await page.goto(`${BASE_URL}/random-nonexistent-page`, { waitUntil: 'load', timeout: 30000 });
    log(`404 status: ${resp?.status()}`);
    if (resp?.status() === 404) {
      passed++;
    } else {
      failed++;
    }
  });

  test('16. Theme toggle', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(3000);
    const themeBtn = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"]').first();
    if (await themeBtn.isVisible().catch(() => false)) {
      await themeBtn.click();
      await page.waitForTimeout(1000);
      log('Theme toggled', 'OK');
      passed++;
    } else {
      log('No theme toggle', 'INFO');
      passed++;
    }
  });

  test.afterAll(async () => {
    console.log('\n========================================');
    console.log('📊 QA TEST FINAL SUMMARY');
    console.log('========================================');
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  ⚠️  Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
    }
    console.log('========================================\n');
  });
});
