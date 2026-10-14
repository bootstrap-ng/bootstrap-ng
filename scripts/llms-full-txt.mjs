// Generates llms-full.txt (https://llmstxt.org): every docs page as Markdown in one file.
// It reads the prerendered pages, so run it after `ng build docs`. Examples keep their HTML and
// TypeScript sources, and live previews are left out.
// Usage: node scripts/llms-full-txt.mjs [--base-url https://example.com/docs/] [--out dist/docs/browser]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { parse } from 'parse5';
import { NAV } from '../projects/docs/src/app/nav.ts';
import { LLMS_INTRO } from './llms-intro.mjs';

const { values } = parseArgs({
  options: {
    'base-url': { type: 'string', default: 'https://bootstrap-ng.com/' },
    out: { type: 'string', default: 'dist/docs/browser' },
  },
});

const baseUrl = values['base-url'].endsWith('/') ? values['base-url'] : `${values['base-url']}/`;
const pagesDir = 'projects/docs/src/app/pages';

/** Code block languages for the `data-language` that docs-code sets. */
const FENCE_LANGUAGES = { 'angular-html': 'html', 'angular-ts': 'ts', shellscript: 'sh' };

const attr = (node, name) => node.attrs?.find((a) => a.name === name)?.value;
const classes = (node) => (attr(node, 'class') ?? '').split(/\s+/);
const children = (node) => node.childNodes ?? [];

function find(node, test) {
  for (const child of children(node)) {
    if (test(child)) return child;
    const match = find(child, test);
    if (match) return match;
  }
  return undefined;
}

const textContent = (node) =>
  node.nodeName === '#text' ? node.value : children(node).map(textContent).join('');

/**
 * Maps the section ids of a component or form page to the TypeScript source of their example.
 * Prerendered pages only contain the source tab that is open, which is the HTML one.
 */
function exampleTs(path) {
  const [section, name] = path.split('/');
  if (section !== 'components' && section !== 'forms') return new Map();
  const dir = join(pagesDir, section, name);
  const source = readFileSync(join(dir, `${name}.ts`), 'utf8');
  const imports = new Map(
    [...source.matchAll(/import (\w+) from '(\.\/[^']+\.ts)' with \{ loader: 'text' \}/g)].map(
      ([, id, file]) => [id, file],
    ),
  );
  const ids = [...source.matchAll(/\bid: '([^']+)'/g)];
  const map = new Map();
  ids.forEach((match, i) => {
    const block = source.slice(match.index, ids[i + 1]?.index);
    const ts = block.match(/\bts: (\w+)/)?.[1];
    if (!ts) return;
    const file = imports.get(ts);
    if (!file) throw new Error(`No text import for ${ts} in ${path}`);
    map.set(match[1], readFileSync(join(dir, file), 'utf8').trim());
  });
  return map;
}

function fence(code, language = '') {
  const ticks = '`'.repeat(Math.max(3, ...[...code.matchAll(/`+/g)].map((m) => m[0].length + 1)));
  return `${ticks}${language}\n${code.replace(/\n$/, '')}\n${ticks}`;
}

function inlineCode(text) {
  const ticks = '`'.repeat(Math.max(1, ...[...text.matchAll(/`+/g)].map((m) => m[0].length + 1)));
  const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
  return `${ticks}${pad}${text}${pad}${ticks}`;
}

/** Renders one prerendered page's `<main>` as Markdown. */
function pageMarkdown(path, html) {
  const document = parse(html);
  const main = find(document, (node) => node.nodeName === 'main');
  if (!main) throw new Error(`No <main> in ${path}`);
  const basePath = attr(find(document, (node) => node.nodeName === 'base') ?? {}, 'href') ?? '/';
  const pageUrl = `${baseUrl}${path}/`;
  const tsSources = exampleTs(path);
  let section = '';

  const url = (href) =>
    href.startsWith(basePath) && !href.startsWith('//')
      ? `${baseUrl}${href.slice(basePath.length)}`
      : new URL(href, pageUrl).href;

  function inline(node) {
    if (node.nodeName === '#text') return node.value.replace(/\s+/g, ' ');
    if (node.nodeName === '#comment') return '';
    if (classes(node).includes('anchor-link')) return '';
    const content = () => children(node).map(inline).join('');
    switch (node.nodeName) {
      case 'code':
      case 'kbd':
        return inlineCode(textContent(node).replace(/\s+/g, ' '));
      case 'strong':
      case 'b':
        return `**${content().trim()}**`;
      case 'em':
      case 'i':
        return `_${content().trim()}_`;
      case 'a': {
        const href = attr(node, 'href');
        const text = content().trim();
        return href ? `[${text}](${url(href)})` : text;
      }
      case 'br':
        return '\n';
      default:
        return content();
    }
  }

  const inlineBlock = (node) =>
    children(node)
      .map(inline)
      .join('')
      .replace(/ *\n */g, '\n')
      .replace(/ {2,}/g, ' ')
      .trim();

  function table(node) {
    const rows = [];
    (function collect(parent) {
      for (const child of children(parent)) {
        if (child.nodeName === 'tr') {
          rows.push(
            children(child)
              .filter((cell) => cell.nodeName === 'th' || cell.nodeName === 'td')
              .map((cell) => inlineBlock(cell).replace(/\|/g, '\\|').replace(/\n/g, ' ')),
          );
        } else {
          collect(child);
        }
      }
    })(node);
    const [head, ...body] = rows;
    return [head, head.map(() => '---'), ...body].map((row) => `| ${row.join(' | ')} |`).join('\n');
  }

  function list(node, ordered) {
    return children(node)
      .filter((child) => child.nodeName === 'li')
      .map((item, i) => {
        const marker = ordered ? `${i + 1}. ` : '- ';
        const body = blocks(item).join('\n\n');
        return (
          marker + body.replace(/\n/g, `\n${' '.repeat(marker.length)}`).replace(/\n +\n/g, '\n\n')
        );
      })
      .join('\n');
  }

  function code(node) {
    const pre = find(node, (child) => child.nodeName === 'pre');
    if (!pre) throw new Error(`No code in a docs-code on ${path}`);
    const language = attr(node, 'data-language') ?? '';
    return fence(textContent(pre), FENCE_LANGUAGES[language] ?? language);
  }

  function example(node) {
    const docsCode = find(node, (child) => child.nodeName === 'docs-code');
    if (!docsCode) throw new Error(`No source in an example on ${path}`);
    const parts = [code(docsCode)];
    const ts = tsSources.get(section);
    if (ts) {
      parts.push(fence(ts, 'ts'));
      tsSources.delete(section);
    }
    return parts;
  }

  /** Renders a node's children as Markdown blocks, grouping runs of inline content into paragraphs. */
  function blocks(node) {
    const output = [];
    let run = [];
    const flush = () => {
      const text = run.map(inline).join('').replace(/\s+/g, ' ').trim();
      if (text) output.push(text);
      run = [];
    };
    for (const child of children(node)) {
      const name = child.nodeName;
      if (name === '#comment' || name === 'button' || name === 'svg') continue;
      if (
        name === '#text' ||
        ['a', 'code', 'kbd', 'strong', 'b', 'em', 'i', 'abbr', 'span', 'br'].includes(name)
      ) {
        run.push(child);
        continue;
      }
      flush();
      if (attr(child, 'data-pagefind-ignore') !== undefined && name === 'div') continue;
      const heading = name.match(/^h([1-6])$/);
      if (heading) {
        if (name === 'h2') section = attr(child, 'id') ?? '';
        output.push(`${'#'.repeat(Number(heading[1]))} ${inlineBlock(child)}`);
        if (name === 'h1') output.push(`Source: <${pageUrl}>`);
      } else if (name === 'p') {
        const text = inlineBlock(child);
        if (text) output.push(text);
      } else if (name === 'ul' || name === 'ol') {
        output.push(list(child, name === 'ol'));
      } else if (name === 'table') {
        output.push(table(child));
      } else if (name === 'pre') {
        output.push(fence(textContent(child)));
      } else if (name === 'docs-code') {
        output.push(code(child));
      } else if (name === 'docs-example') {
        output.push(...example(child));
      } else if (attr(child, 'role') === 'alert') {
        output.push(blocks(child).join('\n\n').replace(/^/gm, '> ').replace(/^> $/gm, '>'));
      } else {
        output.push(...blocks(child));
      }
    }
    flush();
    return output;
  }

  const markdown = blocks(main).join('\n\n');
  if (tsSources.size) {
    throw new Error(`Examples ${[...tsSources.keys()].join(', ')} on ${path} were not found`);
  }
  return markdown;
}

const pages = NAV.flatMap((section) => section.items).map((item) =>
  pageMarkdown(item.path, readFileSync(join(values.out, item.path, 'index.html'), 'utf8')),
);

const llmsFullTxt = `${LLMS_INTRO}

This file contains every page of the bootstrap-ng documentation. [llms.txt](${baseUrl}llms.txt) lists the pages with a short summary of each.

${pages.join('\n\n---\n\n')}
`;

writeFileSync(join(values.out, 'llms-full.txt'), llmsFullTxt);
console.log(`Wrote ${join(values.out, 'llms-full.txt')} with ${pages.length} pages`);
