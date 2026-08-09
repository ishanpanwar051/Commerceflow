# Browser-level image verification

The production acceptance rule is:

> HTTP 200 **is not** proof that an image renders. A product image passes only
> when the browser actually loads it, decodes it, and displays it at real size
> without the gray placeholder.

`verify-live-images.mjs` drives a real Chromium browser against the live app
(passed as `BASE_URL`, defaults to the Render frontend) and checks, per rendered
product image:

1. `<img>` exists
2. final `src` exists and is not `/placeholder.svg`
3. `img.complete === true`
4. `naturalWidth > 0` (the bytes decoded into an image)
5. rendered dimensions `> 0`
6. not hidden (`display` / `visibility` / `opacity`)
7. placeholder layer is not covering it

## Run

```bash
# one-time setup (from the repo root)
npm i -D playwright
npx playwright install chromium

# verify the live app
node browser-tests/verify-live-images.mjs

# optional: watch the browser, point at another deployment
HEADLESS=0 BASE_URL=https://commerceflow-frontend-5c7v.onrender.com node browser-tests/verify-live-images.mjs
```

The script logs in with the demo customer (`customer@example.com` / `Admin@123`,
the homepage is behind `ProtectedRoute`), then scrolls through:

- Homepage (Featured / Deal of the Day / Bestsellers / New Arrivals)
- `/products`
- `/categories`
- a previously-broken product detail page (DeathAdder V3 Pro)
- live search for the previously-reported broken set (Sennheiser / PlayStation /
  JBL / Galaxy Tab)

Exit code `0` = every rendered product image loaded and is visible.
Exit code `1` = at least one broken/placeholder image (details printed).