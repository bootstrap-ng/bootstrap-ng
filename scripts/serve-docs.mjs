// Serves the built docs site the way GitHub Pages does, for the end-to-end tests.
// Usage: node scripts/serve-docs.mjs [--port 4300] [--dir dist/docs/browser]
import { createReadStream, statSync } from 'node:fs';
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
  // Like GitHub Pages: a folder requested without its trailing slash redirects to it.
  if (inside && !pathname.endsWith('/') && isDirectory(path)) {
    response.writeHead(301, { Location: `${pathname}/` });
    response.end();
    return;
  }
  const found = inside ? file(path) : null;
  // Like the 404.html copy on GitHub Pages: unknown paths load the client-rendered app.
  const served = found ?? join(values.dir, 'index.csr.html');
  response.writeHead(found ? 200 : 404, {
    'Content-Type': TYPES[extname(served)] ?? 'application/octet-stream',
  });
  createReadStream(served).pipe(response);
}).listen(Number(values.port), () => {
  console.log(`Serving ${values.dir} at http://localhost:${values.port}/`);
});
