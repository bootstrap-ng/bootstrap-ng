// Generates llms.txt (https://llmstxt.org) for the docs site from its navigation and page leads.
// Usage: node scripts/llms-txt.mjs [--base-url https://example.com/docs/] [--out dist/docs/browser]
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { NAV } from '../projects/docs/src/app/nav.ts';
import { LLMS_INTRO } from './llms-intro.mjs';
import { lead } from './page-leads.mjs';

const { values } = parseArgs({
  options: {
    'base-url': { type: 'string', default: 'https://bootstrap-ng.com/' },
    out: { type: 'string', default: 'dist/docs/browser' },
  },
});

const baseUrl = values['base-url'].endsWith('/') ? values['base-url'] : `${values['base-url']}/`;
/** Leads are plain text, so element names such as `<dialog>` are shown as code. */
const markdown = (text) => text.replace(/<[a-z]+>/g, '`$&`');

const sections = NAV.map(
  (section) =>
    `## ${section.title}\n\n` +
    section.items
      .map((item) => `- [${item.title}](${baseUrl}${item.path}/): ${markdown(lead(item.path))}`)
      .join('\n'),
);

const llmsTxt = `${LLMS_INTRO}

${sections.join('\n\n')}

## Optional

- [Full documentation](${baseUrl}llms-full.txt): every page of these docs, with example code and API tables, in one Markdown file
- [Source code](https://github.com/bootstrap-ng/bootstrap-ng): the library and this docs site
- [Bootstrap 6 docs](https://v6-dev--twbs-bootstrap.netlify.app/): the CSS, markup and theming that bootstrap-ng builds on
`;

writeFileSync(join(values.out, 'llms.txt'), llmsTxt);
console.log(`Wrote ${join(values.out, 'llms.txt')}`);
