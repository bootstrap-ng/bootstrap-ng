// Prefixes the docs pages' <link rel="modulepreload"> URLs with the base href, so run this after the
// pages are built. Angular writes them relative to <base href="/">, which browsers resolve
// correctly. Cloudflare Pages also copies these links into Link response headers for Early Hints,
// and a URL in a Link header resolves against the page's own URL instead, so
// /components/list-group/ preloaded /components/list-group/chunk-*.js and got a 404.
// Usage: node scripts/absolute-preloads.mjs [--out dist/docs/browser]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    out: { type: 'string', default: 'dist/docs/browser' },
  },
});

/** Matches the page's <base href>, capturing it. */
const BASE = /<base\b[^>]*\bhref="([^"]*)"/i;

/** Matches a modulepreload link up to a relative href value (no scheme and no leading slash). */
const RELATIVE_PRELOAD =
  /(<link\b[^>]*\brel="modulepreload"[^>]*\bhref=")(?![a-z][a-z\d+.-]*:|\/)/gi;

let pages = 0;
for (const name of readdirSync(values.out, { recursive: true })) {
  if (!name.endsWith('.html')) continue;
  const file = join(values.out, name);
  const html = readFileSync(file, 'utf8');
  const base = BASE.exec(html)?.[1] ?? '/';
  const fixed = html.replace(RELATIVE_PRELOAD, (link) => link + base);
  if (fixed !== html) {
    writeFileSync(file, fixed);
    pages++;
  }
}
console.log(`Prefixed module preload URLs with the base href in ${pages} pages`);
