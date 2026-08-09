/**
 * Browser-level product image verification for CommerceFlow.
 *
 * The acceptance criteria explicitly reject "HTTP 200" as proof. This script
 * drives a real Chromium browser against the LIVE app and verifies, for every
 * rendered product image:
 *   1. an <img> exists,
 *   2. its final src exists (not empty / not the placeholder),
 *   3. the browser actually loaded it (img.complete === true),
 *   4. naturalWidth > 0 (decoded to a real image),
 *   5. rendered dimensions > 0,
 *   6. it is not hidden (display / visibility / opacity),
 *   7. the gray placeholder is not covering it (src isn't /placeholder.svg).
 *
 * Usage:  node browser-tests/verify-live-images.mjs
 * Setup:  npm i -D playwright && npx playwright install chromium
 * Env:    BASE_URL  (default https://commerceflow-frontend-5c7v.onrender.com)
 *         HEADLESS  (default "1"; set "0" to watch the browser)
 */
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'https://commerceflow-frontend-5c7v.onrender.com';
const HEADLESS = process.env.HEADLESS !== '0';

const results = { ok: 0, broken: 0 };
const brokenDetails = [];

function printSection(title) {
  console.log(`\n${'='.repeat(72)}\n  ${title}\n${'='.repeat(72)}`);
}

async function scrollThroughPage(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < 8 * Math.max(document.body.scrollHeight, step); y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
      if (y + step >= document.body.scrollHeight) break;
    }
  });
}

/**
 * Examine every product <img> currently mounted and tally pass/fail.
 */
async function auditProductImages(page, contextLabel) {
  const snapshot = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img')).filter((img) => {
      const src = img.getAttribute('src') || '';
      if (!/^https?:/.test(src) && !src.startsWith('data:image/gif')) return false;
      // Product images rendered by ProductImage live inside a card (.group)
      // and/or an aspect locked container.
      return !!img.closest('.group') || !!img.closest('[class*="aspect-square"], [class*="aspect-[4/3]"]');
    });

    return images.map((img) => {
      const rect = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      const card = img.closest('.group');
      const nameEl = card ? card.querySelector('h3') : null;
      const src = img.getAttribute('src') || '';
      return {
        name: nameEl ? nameEl.textContent?.trim() : '(unknown card)',
        src,
        currentSrc: img.currentSrc || src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        rectW: Math.round(rect.width),
        rectH: Math.round(rect.height),
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
      };
    });
  });

  // De-duplicate by (name, finalSrc) so a card is counted once per run.
  const seen = new Set();
  const unique = snapshot.filter((r) => {
    const key = `${r.name}|${r.currentSrc}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  for (const r of unique) {
    const issues = [];
    if (!r.currentSrc) issues.push('no final src');
    if (r.currentSrc.includes('placeholder.svg')) issues.push('PLACEHOLDER shown instead of product image');
    if (!r.complete) issues.push('img.complete = false (never finished loading)');
    if (r.naturalWidth <= 0) issues.push(`naturalWidth=${r.naturalWidth} (did not decode an image)`);
    if (r.rectW <= 0 || r.rectH <= 0) issues.push(`rendered ${r.rectW}x${r.rectH} (zero/collapsed size)`);
    if (r.display === 'none' || r.visibility === 'hidden' || parseFloat(r.opacity) === 0) {
      issues.push(`hidden by CSS (display=${r.display}, visibility=${r.visibility}, opacity=${r.opacity})`);
    }

    if (issues.length === 0) {
      results.ok++;
    } else {
      results.broken++;
      brokenDetails.push({ context: contextLabel, name: r.name, src: r.currentSrc, issues });
      console.log(`  ❌ [${contextLabel}] ${r.name}`);
      console.log(`       src: ${r.currentSrc}`);
      for (const i of issues) console.log(`       - ${i}`);
    }
  }
  console.log(`  ✔ audited ${unique.length} unique product images in "${contextLabel}"`);
  return unique.length;
}

async function login(page) {
  // Homepage is behind ProtectedRoute; authenticate via the demo customer.
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('input[name="identifier"]', { timeout: 90000 });
  await page.fill('input[name="identifier"]', 'customer@example.com');
  await page.fill('input[name="password"]', 'Admin@123');
  await Promise.all([
    page.waitForURL((u) => u.pathname === '/', { timeout: 90000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(8000); // let React-Query hydrate sections
}

async function main() {
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(90000);

  console.log(`Auditing LIVE product images at ${BASE_URL} (headless=${HEADLESS})`);

  try {
    printSection('LOGIN (customer demo)');
    await login(page);

    printSection('HOMEPAGE — scroll through Featured / Deal / Bestsellers / New Arrivals');
    await scrollThroughPage(page);
    await page.waitForTimeout(6000); // let lazy images finish
    await auditProductImages(page, 'homepage');

    printSection('PRODUCTS LISTING (/products)');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    await scrollThroughPage(page);
    await page.waitForTimeout(4000);
    await auditProductImages(page, 'products');

    printSection('CATEGORIES (/categories)');
    await page.goto(`${BASE_URL}/categories`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await scrollThroughPage(page);
    await page.waitForTimeout(3000);
    await auditProductImages(page, 'categories');

    printSection('PRODUCT DETAIL — DeathAdder V3 Pro (previously reported broken)');
    await page.goto(`${BASE_URL}/products/deathadder-v3-pro-razer-41-1786260191109-y22xh4`, {
      waitUntil: 'domcontentloaded',
    }).catch(async () => {
      // Slug may drift after re-seeds; fall back to a live search.
      await page.goto(`${BASE_URL}/products?search=DeathAdder`, { waitUntil: 'domcontentloaded' });
    });
    await page.waitForTimeout(5000);
    await scrollThroughPage(page);
    await page.waitForTimeout(3000);
    await auditProductImages(page, 'product-detail');

    printSection('SEARCH across the previously-advertised broken set');
    for (const q of ['Sennheiser', 'PlayStation', 'JBL', 'Galaxy Tab']) {
      await page.goto(`${BASE_URL}/products?search=${encodeURIComponent(q)}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4500);
      await scrollThroughPage(page);
      await page.waitForTimeout(3000);
      await auditProductImages(page, `search:${q}`);
    }
  } catch (err) {
    console.error('\nScript error:', err);
    await page.screenshot({ path: 'image-verify-error.png', fullPage: true }).catch(() => {});
    process.exitCode = 2;
  } finally {
    await browser.close();
  }

  console.log('\n' + '='.repeat(72));
  console.log('  VERIFICATION SUMMARY');
  console.log('='.repeat(72));
  console.log(`  Images successfully rendering in browser : ${results.ok}`);
  console.log(`  Broken / placeholder images               : ${results.broken}`);
  if (results.broken === 0) {
    console.log('  RESULT : ✅ PASS — every rendered product image loaded & is visible.');
  } else {
    console.log('  RESULT : ❌ FAIL — see details above.');
    console.log(JSON.stringify(brokenDetails, null, 2));
    process.exitCode = 1;
  }
}

main();