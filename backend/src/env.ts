import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Loads .env from the package directory or any parent up to the workspace root.
// This keeps the api-server runnable from both its own directory and the repo root.
function loadEnv(): void {
  let dir = path.resolve(process.cwd());
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, '.env');
    if (existsSync(candidate)) {
      dotenv.config({ path: candidate });
      return;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  dotenv.config();
}

loadEnv();
