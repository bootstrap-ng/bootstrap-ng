// Writes the Cloudflare Pages _headers file (https://developers.cloudflare.com/pages/configuration/headers/)
// with the docs site's security headers. Each prerendered page gets its own Content-Security-Policy
// that allows its inline scripts by their SHA-256 hashes, so run this after the pages are built.
// Angular's event replay script differs from page to page, and one policy listing every page's
// hash would soon pass Cloudflare's limit of 2,000 characters for a header value.
// Usage: node scripts/headers.mjs [--out dist/docs/browser]
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    out: { type: 'string', default: 'dist/docs/browser' },
  },
});

/** Hashes of the inline scripts in `html`, such as the color mode script. */
function inlineScriptHashes(html) {
  const hashes = new Set();
  for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    // External scripts are covered by 'self', and data blocks such as ng-state don't run.
    if (/\ssrc=/.test(attributes) || /\stype="(?!module"|text\/javascript")/.test(attributes)) {
      continue;
    }
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
  return [...hashes];
}

const JSDELIVR = 'https://cdn.jsdelivr.net';
const CLOUDFLARE_ANALYTICS = 'https://static.cloudflareinsights.com';

const csp = (scriptHashes) => ({
  'default-src': ["'self'"],
  // Angular's prerendered pages inline their event replay script, and index.html the color mode
  // script. 'wasm-unsafe-eval' lets Pagefind search run its WebAssembly module when it can't use
  // its web worker.
  'script-src': ["'self'", ...scriptHashes, "'wasm-unsafe-eval'", CLOUDFLARE_ANALYTICS],
  // Angular adds component styles in <style> elements, and Shiki and Floating UI set style attributes.
  'style-src': ["'self'", "'unsafe-inline'", JSDELIVR, 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'blob:'],
  // bs-icon fetches its SVGs from jsDelivr.
  'connect-src': ["'self'", JSDELIVR, 'https://cloudflareinsights.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
});

const headers = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'accelerometer=()',
    'autoplay=()',
    'browsing-topics=()',
    'camera=()',
    'display-capture=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'payment=()',
    'usb=()',
  ].join(', '),
  'Cross-Origin-Opener-Policy': 'same-origin',
};

const rules = [['/*', headers]];
for (const name of readdirSync(values.out, { recursive: true }).sort()) {
  // Pages are served at their folder's URL. 404.html and index.csr.html answer unknown paths,
  // which no rule can match, so those responses get only the headers above.
  if (!name.endsWith('index.html')) continue;
  const html = readFileSync(join(values.out, name), 'utf8');
  const policy = Object.entries(csp(inlineScriptHashes(html)))
    .map(([directive, sources]) => [directive, ...sources].join(' '))
    .join('; ');
  rules.push([`/${name.slice(0, -'index.html'.length)}`, { 'Content-Security-Policy': policy }]);
}

// https://developers.cloudflare.com/pages/configuration/headers/#limits
if (rules.length > 100) {
  throw new Error(`_headers has ${rules.length} rules, more than the 100 Cloudflare Pages allows.`);
}

const lines = rules.flatMap(([path, pathHeaders]) => [
  path,
  ...Object.entries(pathHeaders).map(([name, value]) => `  ${name}: ${value}`),
]);
writeFileSync(join(values.out, '_headers'), `${lines.join('\n')}\n`);
console.log(`Wrote ${join(values.out, '_headers')}`);
