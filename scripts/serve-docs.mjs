// Serves the built docs site the way Cloudflare Pages does, for the end-to-end tests.
// Usage: node scripts/serve-docs.mjs [--port 4300] [--dir dist/docs/browser]
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    port: { type: 'string', default: '4300' },
    dir: { type: 'string', default: 'dist/docs/browser' },
  },
});

const TYPES = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
};

function file(path) {
  try {
    const stat = statSync(path);
    if (stat.isFile()) return path;
    if (stat.isDirectory()) return file(join(path, 'index.html'));
  } catch {
    // Not found.
  }
  return null;
}

/**
 * Rules from the _headers file that scripts/headers.mjs writes, as [pattern, headers] pairs.
 * Supports the `*` splat in paths, like Cloudflare Pages.
 */
function headerRules() {
  let text;
  try {
    text = readFileSync(join(values.dir, '_headers'), 'utf8');
  } catch {
    return [];
  }
  const rules = [];
  for (const line of text.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (/^\s/.test(line)) {
      const [, name, value] = /^\s+([^:]+):\s*(.*)$/.exec(line) ?? [];
      if (name) rules.at(-1)?.[1].push([name, value]);
    } else {
      const pattern = line
        .trim()
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      rules.push([new RegExp(`^${pattern}$`), []]);
    }
  }
  return rules;
}

const rules = headerRules();

function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost');
  const path = normalize(join(values.dir, decodeURIComponent(pathname)));
  const inside = path.startsWith(normalize(values.dir));
  // Like Cloudflare Pages: a folder requested without its trailing slash redirects to it.
  for (const [pattern, headers] of rules) {
    if (pattern.test(pathname))
      for (const [name, value] of headers) response.setHeader(name, value);
  }
  if (inside && !pathname.endsWith('/') && isDirectory(path)) {
    response.writeHead(301, { Location: `${pathname}/` });
    response.end();
    return;
  }
  const found = inside ? file(path) : null;
  // Like 404.html on Cloudflare Pages: unknown paths load the client-rendered app.
  const served = found ?? join(values.dir, 'index.csr.html');
  response.writeHead(found ? 200 : 404, {
    'Content-Type': TYPES[extname(served)] ?? 'application/octet-stream',
  });
  createReadStream(served).pipe(response);
}).listen(Number(values.port), () => {
  console.log(`Serving ${values.dir} at http://localhost:${values.port}/`);
});
