import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const exactEntries = ['index.html', 'manifest.webmanifest', 'sw.js'];
const prefixEntries = ['workbox-', 'registerSW.js'];
const directoryEntries = ['assets', 'dist'];

async function removeIfExists(targetPath) {
  await rm(targetPath, { recursive: true, force: true });
}

await Promise.all(exactEntries.map((entry) => removeIfExists(path.join(repoRoot, entry))));
await Promise.all(directoryEntries.map((entry) => removeIfExists(path.join(repoRoot, entry))));

const repoEntries = await readdir(repoRoot, { withFileTypes: true });

await Promise.all(
  repoEntries
    .filter((entry) => prefixEntries.some((prefix) => entry.name.startsWith(prefix)))
    .map((entry) => removeIfExists(path.join(repoRoot, entry.name)))
);