import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BsFormControl, BsFormField, BsFormLabel, BsTypeahead } from 'bootstrap-ng';

interface Framework {
  name: string;
  language: string;
}

const FRAMEWORKS: Framework[] = [
  { name: 'Angular', language: 'TypeScript' },
  { name: 'Astro', language: 'JavaScript' },
  { name: 'Django', language: 'Python' },
  { name: 'Express', language: 'JavaScript' },
  { name: 'Flask', language: 'Python' },
  { name: 'Laravel', language: 'PHP' },
  { name: 'Next.js', language: 'JavaScript' },
  { name: 'Nuxt', language: 'JavaScript' },
  { name: 'Phoenix', language: 'Elixir' },
  { name: 'Rails', language: 'Ruby' },
  { name: 'Spring', language: 'Java' },
  { name: 'Svelte', language: 'JavaScript' },
];

@Component({
  selector: 'docs-typeahead-async-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BsFormControl, BsFormField, BsFormLabel, BsTypeahead],
  templateUrl: './async.html',
})
export class TypeaheadAsyncExample {
  protected readonly picked = signal<Framework | null>(null);

  protected readonly name = (framework: Framework): string => framework.name;

  /** Stands in for a server request, such as `fetch()` or `HttpClient`. */
  protected readonly search = async (term: string): Promise<Framework[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return FRAMEWORKS.filter((framework) =>
      framework.name.toLowerCase().includes(term.toLowerCase()),
    );
  };
}
