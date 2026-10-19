// Reads the one-line summary of a docs page, shared by llms.txt and the pages' meta descriptions.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const pagesDir = 'projects/docs/src/app/pages';

/** Reads a page's one-line summary: the `lead` of a component page or the paragraph after the `<h1>`. */
export function lead(path) {
  const [section, name] = path.split('/');
  if (section === 'components' || section === 'forms') {
    const source = readFileSync(join(pagesDir, section, name, `${name}.ts`), 'utf8');
    const match = source.match(/lead:\s*'((?:[^'\\]|\\.)*)'/);
    if (!match) throw new Error(`No lead found for ${path}`);
    // Turn the single-quoted literal into a JSON string in one pass, so each escape sequence is
    // read whole: \' becomes ', a bare " is escaped, and other escapes such as \\ are kept.
    const json = match[1].replace(/\\.|"/g, (token) =>
      token === "\\'" ? "'" : token === '"' ? '\\"' : token,
    );
    return JSON.parse(`"${json}"`);
  }
  const file = path === 'getting-started' ? 'introduction' : path.split('/').pop();
  const source = readFileSync(join(pagesDir, 'getting-started', `${file}.html`), 'utf8');
  const match = source.match(/<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  if (!match) throw new Error(`No lead found for ${path}`);
  return match[1].replace(/\s+/g, ' ').trim();
}
