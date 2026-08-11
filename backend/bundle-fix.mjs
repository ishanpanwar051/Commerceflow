import { build as esbuild } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

globalThis.require = createRequire(import.meta.url);
const dir = path.dirname(fileURLToPath(import.meta.url));

const banner = `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`;

await esbuild({
  entryPoints: [path.resolve(dir, "scripts/fix-product-images.ts")],
  platform: "node",
  bundle: true,
  format: "esm",
  outfile: path.resolve(dir, "dist/fix-product-images.mjs"),
  logLevel: "info",
  external: ["@prisma/client", "*.node"],
  banner: { js: banner },
});

console.log("bundled dist/fix-product-images.mjs");
