import { cp, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');

const entries = await readdir(distDir, { withFileTypes: true });

await Promise.all(
  entries.map((entry) =>
    cp(path.join(distDir, entry.name), path.join(repoRoot, entry.name), {
      recursive: entry.isDirectory(),
      force: true
    })
  )
);