// Zips dist/ into release/nebula-<version>.zip (needs the `zip` command).
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';

if (!existsSync('dist/manifest.json')) {
  console.error('dist/ is missing. Run npm run build first.');
  process.exit(1);
}
const { version } = JSON.parse(readFileSync('public/manifest.json', 'utf8'));
mkdirSync('release', { recursive: true });
const out = `release/nebula-${version}.zip`;
try {
  execSync(`cd dist && zip -r -q ../${out} .`, { stdio: 'inherit' });
  console.log(`Created ${out}`);
} catch {
  console.log(`Could not run "zip". Zip the CONTENTS of dist/ manually as ${out}.`);
}
