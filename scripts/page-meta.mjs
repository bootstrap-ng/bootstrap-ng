// Adds a canonical link and a last-modified meta tag to each prerendered docs page, and gives each
// page its own description (from its lead), og:title, og:description and og:url.
// The date is that of the commit being built, or the build time when git has none.
// Also drops the redundant type="text/javascript" Angular puts on its event-replay script.
// Usage: node scripts/page-meta.mjs [--base-url https://example.com/docs/] [--out dist/docs/browser]
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { NAV } from '../projects/docs/src/app/nav.ts';
import { lead } from './page-leads.mjs';

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
const escape = (text) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Replaces the content of the meta tag that `attribute` names, which index.html must define. */
function setMeta(html, attribute, content, file) {
  const pattern = new RegExp(`(<meta ${attribute} content=")[^"]*(")`);
  if (!pattern.test(html)) throw new Error(`${file} has no <meta ${attribute}>`);
  return html.replace(pattern, `$1${escape(content)}$2`);
}

const paths = ['', ...NAV.flatMap((section) => section.items.map((item) => item.path))];
const descriptions = new Set();

for (const path of paths) {
  const file = join(values.out, path, 'index.html');
  let html = readFileSync(file, 'utf8');
  if (html.includes('rel="canonical"')) throw new Error(`${file} already has a canonical link`);
  const url = `${baseUrl}${path ? `${path}/` : ''}`;
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) throw new Error(`${file} has no <title>`);
  if (path) {
    // The home page keeps the site description from index.html.
    const description = lead(path);
    html = setMeta(html, 'name="description"', description, file);
    html = setMeta(html, 'property="og:description"', description, file);
  }
  const description = html.match(/<meta name="description" content="([^"]*)"/)[1];
  if (descriptions.has(description))
    throw new Error(`${file} repeats the description "${description}"`);
  descriptions.add(description);
  // The title is already escaped in the prerendered HTML.
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`);
  html = setMeta(html, 'property="og:url"', url, file);
  const tags =
    `<link rel="canonical" href="${escape(url)}">` +
    `<meta name="last-modified" content="${escape(modified)}">`;
  const output = html
    .replace('</head>', `${tags}</head>`)
    .replace(/(<script\b[^>]*?) type="text\/javascript"/g, '$1');
  writeFileSync(file, output);
}

console.log(
  `Added canonical, description and last-modified tags to ${paths.length} pages in ${values.out}`,
);
