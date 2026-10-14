// Adds a canonical link and a last-modified meta tag to each prerendered docs page.
// The date is that of the commit being built, or the build time when git has none.
// Also drops the redundant type="text/javascript" Angular puts on its event-replay script.
// Usage: node scripts/page-meta.mjs [--base-url https://example.com/docs/] [--out dist/docs/browser]
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { NAV } from '../projects/docs/src/app/nav.ts';

const { values } = parseArgs({
  options: {
    'base-url': { type: 'string', default: 'https://bootstrap-ng.com/' },
    out: { type: 'string', default: 'dist/docs/browser' },
  },
});

const baseUrl = values['base-url'].endsWith('/') ? values['base-url'] : `${values['base-url']}/`;
const buildTime = new Date().toISOString();

/** The date of the commit being deployed, since shared layout, CSS and library changes affect every page. */
function lastModified() {
  const seconds = execFileSync('git', ['log', '-1', '--format=%ct'], { encoding: 'utf8' }).trim();
  return seconds ? new Date(Number(seconds) * 1000).toISOString() : buildTime;
}

const modified = lastModified();
const escape = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const paths = ['', ...NAV.flatMap((section) => section.items.map((item) => item.path))];

for (const path of paths) {
  const file = join(values.out, path, 'index.html');
  const html = readFileSync(file, 'utf8');
  if (html.includes('rel="canonical"')) throw new Error(`${file} already has a canonical link`);
  const tags =
    `<link rel="canonical" href="${escape(`${baseUrl}${path ? `${path}/` : ''}`)}">` +
    `<meta name="last-modified" content="${escape(modified)}">`;
  const output = html
    .replace('</head>', `${tags}</head>`)
    .replace(/(<script\b[^>]*?) type="text\/javascript"/g, '$1');
  writeFileSync(file, output);
}

console.log(`Added canonical and last-modified tags to ${paths.length} pages in ${values.out}`);
