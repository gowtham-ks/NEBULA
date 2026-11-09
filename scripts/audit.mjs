// Privacy / security audit. Run: npm run audit  (fails with exit code 1 on any violation)
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
const ok = (m) => console.log(`ok    ${m}`);
const fail = (m) => { console.error(`FAIL  ${m}`); failures++; };
const warn = (m) => console.warn(`warn  ${m}`);

const manifest = JSON.parse(readFileSync('public/manifest.json', 'utf8'));

// 1. Permissions
const ALLOWED = new Set(['storage', 'activeTab', 'scripting']);
const extra = (manifest.permissions ?? []).filter((p) => !ALLOWED.has(p));
extra.length ? fail(`unexpected permissions: ${extra.join(', ')}`) : ok(`permissions limited to ${[...ALLOWED].join(', ')}`);
manifest.host_permissions?.length ? fail('host_permissions must stay empty (use optional_host_permissions)') : ok('no install-time host permissions');
manifest.content_scripts ? fail('static content_scripts are not allowed; sites are enabled one at a time') : ok('no static content scripts');
manifest.web_accessible_resources ? fail('web_accessible_resources must not be exposed') : ok('no web_accessible_resources');
const csp = manifest.content_security_policy?.extension_pages ?? '';
/'self'/.test(csp) && !/unsafe-|https?:/.test(csp) ? ok('extension page CSP is strict') : fail('extension page CSP missing or too loose');
const ALLOWED_HOSTS = new Set(['http://*/*', 'https://*/*', 'https://returnyoutubedislikeapi.com/*']);
(manifest.optional_host_permissions ?? []).every((h) => ALLOWED_HOSTS.has(h)) ? ok('optional host permissions are the expected set (opt-in only)') : fail('unexpected optional host permissions');

// 2. Source scan
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : /\.(ts|tsx)$/.test(f) && out.push(p);
  }
  return out;
}
const RULES = [
  [/\bfetch\s*\(/, 'network call: fetch'],
  [/XMLHttpRequest/, 'network call: XMLHttpRequest'],
  [/WebSocket/, 'network call: WebSocket'],
  [/sendBeacon/, 'network call: sendBeacon'],
  [/\beval\s*\(/, 'eval'],
  [/new\s+Function\s*\(/, 'new Function'],
  [/document\.write\s*\(/, 'document.write'],
  [/dangerouslySetInnerHTML/, 'dangerouslySetInnerHTML'],
  [/importScripts\s*\(/, 'importScripts'],
  [/chrome\.(history|cookies|webRequest|tabs\.query[^)]*url)/, 'history/cookies/webRequest access'],
];
const INNER_HTML_ALLOWED = 'src/content/engine/picker.ts'; // static template only
const FETCH_ALLOWED = 'src/background/dislikes.ts'; // opt-in dislike count, one host
const FETCH_URL_RE = /^https:\/\/returnyoutubedislikeapi\.com\//;
for (const file of walk('src')) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    const normalized = file.replace(/\\/g, '/');
    for (const [re, label] of RULES) {
      if (label === 'network call: fetch' && normalized.endsWith(FETCH_ALLOWED)) continue;
      if (re.test(line)) fail(`${file}:${i + 1} ${label}`);
    }
    if (/\.(inner|outer)HTML\s*=/.test(line) && !file.replace(/\\/g, '/').endsWith(INNER_HTML_ALLOWED)) fail(`${file}:${i + 1} innerHTML assignment`);
    const urls = line.match(/https?:\/\/[^\s'"`)]+/g) ?? [];
    for (const u of urls) {
      if (normalized.endsWith(FETCH_ALLOWED)) {
        if (!FETCH_URL_RE.test(u)) fail(`${file}:${i + 1} unexpected URL ${u}`);
      } else if (!/w3\.org|example\.com|evil\.test|\$\{/.test(u)) warn(`${file}:${i + 1} URL literal ${u}`);
    }
  });
}
ok('source scan finished');

// 3. Built output (warnings only: bundled libraries may contain generic matches)
if (existsSync('dist')) {
  for (const f of readdirSync('dist/assets').filter((n) => n.endsWith('.js'))) {
    const t = readFileSync(join('dist/assets', f), 'utf8');
    if (/\bnew Function\(|\beval\(/.test(t)) warn(`dist/assets/${f} contains eval/new Function (check which library)`);
  }
  if (existsSync('dist/content.js')) {
    const t = readFileSync('dist/content.js', 'utf8');
    /\bfetch\(|XMLHttpRequest|eval\(|new Function\(/.test(t) ? fail('dist/content.js contains network or eval calls') : ok('dist/content.js has no network or eval calls');
  } else warn('dist/content.js not found: run npm run build first');
} else warn('dist/ not found: build output not scanned');

console.log(failures ? `\n${failures} problem(s) found` : '\nAudit passed');
process.exit(failures ? 1 : 0);
