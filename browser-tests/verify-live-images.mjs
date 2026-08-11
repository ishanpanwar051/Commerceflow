import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
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

async function auditProductImages(page, contextLabel) {
  const snapshot = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img')).filter((img) => {
      const src = img.getAttribute('src') || '';
      return src && !src.startsWith('data:image/gif');
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
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('input[name="identifier"]', { timeout: 5000 });
    await page.fill('input[name="identifier"]', 'customer@example.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  } catch (err) {
    console.log('  ⚠️ Login step skipped/bypassed:', err.message);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  console.log(`Auditing LIVE product images at ${BASE_URL} (headless=${HEADLESS})`);

  try {
    printSection('LOGIN (customer demo)');
    await login(page);

    printSection('HOMEPAGE');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await scrollThroughPage(page);
    await page.waitForTimeout(2000);
    await auditProductImages(page, 'homepage');

    printSection('PRODUCTS LISTING (/products)');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await scrollThroughPage(page);
    await page.waitForTimeout(2000);
    await auditProductImages(page, 'products');

    printSection('CATEGORIES (/categories)');
    await page.goto(`${BASE_URL}/categories`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await auditProductImages(page, 'categories');

  } catch (err) {
    console.error('Audit run encountered an error:', err.message);
  } finally {
    printSection('SUMMARY');
    console.log(`  PASSED / HEALTHY IMAGES: ${results.ok}`);
    console.log(`  BROKEN / PLACEHOLDER:    ${results.broken}`);
    console.log('='.repeat(72));

    await browser.close();
    process.exit(results.broken > 0 ? 1 : 0);
  }
}

main();