import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsHeading } from '../../shared/heading';
import source from '../../../../../../CHANGELOG.md' with { loader: 'text' };

interface Release {
  id: string;
  title: string;
  /** Each change as HTML, with `code` spans as `<code>` elements. */
  items: string[];
  paragraphs: string[];
}

/** Escapes text for HTML and turns `code` spans into `<code>` elements. */
function toHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split('`')
    .map((part, index) => (index % 2 === 1 ? `<code>${part}</code>` : part))
    .join('');
}

/**
 * Reads the releases from CHANGELOG.md, which is kept to a simple format: a `##` heading per
 * release, a flat list of one-line changes, and the occasional plain paragraph. The page has
 * its own title and lead, so the text before the first release is skipped.
 */
function parse(markdown: string): Release[] {
  const releases: Release[] = [];
  for (const line of markdown.split('\n')) {
    const release = releases.at(-1);
    if (line.startsWith('## ')) {
      const title = line.slice(3).trim();
      const version = title.split(' ')[0] ?? title;
      const slug = version.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      releases.push({
        // Ids that start with a digit need escaping in CSS selectors, so versions get a `v`.
        id: /^\d/.test(slug) ? `v${slug}` : slug,
        title,
        items: [],
        paragraphs: [],
      });
    } else if (line.startsWith('- ') && release) {
      release.items.push(toHtml(line.slice(2)));
    } else if (line.trim() && release) {
      release.paragraphs.push(line.trim());
    }
  }
  return releases;
}

@Component({
  selector: 'docs-changelog',
  imports: [DocsHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './changelog.html',
})
export default class Changelog {
  protected readonly releases = parse(source);
}
