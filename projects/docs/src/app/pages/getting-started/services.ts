import { DocsHeading } from '../../shared/heading';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsApiEntry, DocsApiTable } from '../../shared/api-table';
import { DocsCode } from '../../shared/code';

@Component({
  selector: 'docs-services',
  imports: [DocsApiTable, DocsCode, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './services.html',
})
export default class Services {
  protected readonly toaster = `import { Component, inject } from '@angular/core';
import { BsButton, BsToaster } from 'bootstrap-ng';

@Component({
  selector: 'app-save',
  imports: [BsButton],
  template: \`<button type="button" bsButton theme="primary" (click)="save()">Save</button>\`,
})
export class Save {
  private readonly toaster = inject(BsToaster);

  protected save(): void {
    this.toaster.show({ title: 'Saved', body: 'Your changes were saved.' });
  }
}`;

  protected readonly toasterMethods: DocsApiEntry[] = [
    {
      name: 'show(options)',
      type: 'BsToastRef',
      description: 'Shows a toast and returns a reference with hide() and afterHidden.',
    },
    { name: 'clear()', type: 'void', description: 'Hides every toast.' },
    {
      name: 'setPlacement(placement)',
      type: 'void',
      description: "Where the toasts stack on the screen. Defaults to 'bottom-end'.",
    },
  ];

  protected readonly announcer = `import { Component, inject, signal } from '@angular/core';
import { BsLiveAnnouncer } from 'bootstrap-ng';

@Component({ … })
export class Search {
  private readonly announcer = inject(BsLiveAnnouncer);
  protected readonly results = signal<string[]>([]);

  protected search(query: string): void {
    // …
    this.announcer.announce(\`\${this.results().length} results found\`);
  }
}`;

  protected readonly announcerMethods: DocsApiEntry[] = [
    {
      name: 'announce(message, politeness?)',
      type: 'void',
      description:
        "Reads the message out. Politeness is 'polite' (the default) or 'assertive', which interrupts the screen reader and is meant for errors.",
    },
    { name: 'clear()', type: 'void', description: 'Clears pending and current announcements.' },
  ];

  protected readonly icons = `import { ApplicationConfig } from '@angular/core';
import { bootstrapIcons, provideBsIcons } from 'bootstrap-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBsIcons({
      // Icons without a library come from Font Awesome.
      defaultLibrary: 'font-awesome',
      libraries: {
        // Serve Bootstrap Icons from your own site, copied from node_modules/bootstrap-icons/icons.
        bootstrap: bootstrapIcons({ baseUrl: '/icons/bootstrap' }),
        // Any icon set with an SVG file per icon.
        lucide: {
          resolver: (name) => \`https://cdn.jsdelivr.net/npm/lucide-static@1.48.0/icons/\${name}.svg\`,
        },
      },
    }),
  ],
};`;

  protected readonly iconMethods: DocsApiEntry[] = [
    {
      name: 'register(name, library)',
      type: 'void',
      description: 'Adds an icon library, or replaces the one with the same name.',
    },
    {
      name: 'get(name)',
      type: 'BsIconLibrary | undefined',
      description: 'Returns the library registered under the name.',
    },
    {
      name: 'load(url)',
      type: 'Promise<SVGSVGElement>',
      description: 'Fetches an SVG once, removes scripts and event handlers, and returns a copy.',
    },
    {
      name: 'defaultLibrary',
      type: 'WritableSignal<string>',
      description: 'Name of the library that icons without a library use.',
    },
  ];

  protected readonly helpers: DocsApiEntry[] = [
    {
      name: 'themeClass(theme)',
      type: 'string',
      description:
        "Returns the .theme-* class for a BsTheme, such as 'theme-danger', or an empty string when the theme is null.",
    },
    {
      name: 'waitForTransition(element)',
      type: 'Promise<void>',
      description:
        "Resolves when the element's CSS transition ends, at once when it has none, and after a fallback timer if transitionend never fires.",
    },
    {
      name: 'getTransitionDuration(element)',
      type: 'number',
      description: "The element's first transition duration plus delay, in milliseconds.",
    },
    {
      name: 'uniqueId(prefix)',
      type: 'string',
      description: "Returns an id that is unique on the page, such as 'bs-collapse-3'.",
    },
  ];

  protected readonly transition = `protected async close(): Promise<void> {
  this.element.classList.remove('show');
  await waitForTransition(this.element);
  this.closed.emit();
}`;

  protected readonly types: DocsApiEntry[] = [
    {
      name: 'BsTheme',
      type: 'string union',
      description:
        "'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'info' | 'inverse' | 'secondary'",
    },
    {
      name: 'BsPlacement',
      type: 'string union',
      description:
        "Where a tooltip, popover or menu opens: 'top', 'bottom', 'left', 'right', 'start' or 'end', optionally followed by '-start' or '-end'.",
    },
  ];
}
