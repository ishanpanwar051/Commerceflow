import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

for (const file of ['package-lock.json', 'yarn.lock']) {
  try {
    rmSync(join(root, file), { force: true });
  } catch {
    // best effort
  }
}

const userAgent = process.env.npm_config_user_agent ?? '';
const execPath = process.env.npm_execpath ?? '';
const isPnpm = userAgent.startsWith('pnpm/') || /pnpm(\\.cjs)?$/i.test(execPath);

if (!isPnpm) {
  console.error('Use pnpm instead');
  process.exit(1);
}
