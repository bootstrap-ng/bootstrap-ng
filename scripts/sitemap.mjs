// Generates sitemap.xml (https://www.sitemaps.org) for the docs site from its navigation,
// and adds a Sitemap line pointing at it to robots.txt.
// Usage: node scripts/sitemap.mjs [--base-url https://example.com/docs/] [--out dist/docs/browser]
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
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

/** The date of the commit being deployed, matching the last-modified meta tag that page-meta adds. */
function lastModified() {
  const seconds = execFileSync('git', ['log', '-1', '--format=%ct'], { encoding: 'utf8' }).trim();
  return (seconds ? new Date(Number(seconds) * 1000) : new Date()).toISOString();
}

const modified = lastModified();
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const paths = ['', ...NAV.flatMap((section) => section.items.map((item) => item.path))];

const urls = paths
  .map(
    (path) =>
      `  <url>\n    <loc>${escape(`${baseUrl}${path ? `${path}/` : ''}`)}</loc>\n` +
      `    <lastmod>${modified}</lastmod>\n  </url>`,
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(join(values.out, 'sitemap.xml'), sitemap);

const robots = join(values.out, 'robots.txt');
if (/^Sitemap:/im.test(readFileSync(robots, 'utf8')))
  throw new Error(`${robots} already has a Sitemap line`);
appendFileSync(robots, `\nSitemap: ${baseUrl}sitemap.xml\n`);

console.log(
  `Wrote ${join(values.out, 'sitemap.xml')} with ${paths.length} pages and linked it from robots.txt`,
);
