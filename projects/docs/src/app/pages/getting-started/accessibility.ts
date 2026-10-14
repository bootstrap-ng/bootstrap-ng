import { DocsHeading } from '../../shared/heading';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../../shared/code';

interface KeyboardRow {
  name: string;
  path: string;
  keys: string;
}

@Component({
  selector: 'docs-accessibility',
  imports: [DocsCode, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accessibility.html',
})
export default class Accessibility {
  protected readonly keyboard: KeyboardRow[] = [
    {
      name: 'Tabs',
      path: '/components/tab',
      keys: 'Arrow keys move between tabs (Left/Right, or Up/Down when vertical); Home and End go to the first and last tab. Only the active tab is in the Tab order.',
    },
    {
      name: 'Menu',
      path: '/components/menu',
      keys: 'Up and Down move between items, Home and End go to the first and last item, and Escape closes the menu and returns focus to its toggle. Right, Left and Enter open and close submenus.',
    },
    {
      name: 'Dialog and drawer',
      path: '/components/dialog',
      keys: 'Modal dialogs trap focus and close with Escape, using the native <dialog> element.',
    },
    {
      name: 'Tooltip and popover',
      path: '/components/tooltip',
      keys: 'Open on focus as well as hover, and close with Escape. Tab moves from the trigger into a popover and back out to the next control on the page.',
    },
    {
      name: 'Carousel',
      path: '/components/carousel',
      keys: 'Left and Right show the previous and next slide. Autoplay pauses while focus or the pointer is inside.',
    },
    {
      name: 'Button group toolbar',
      path: '/components/button-group',
      keys: 'Left and Right move between buttons; Home and End go to the first and last.',
    },
    {
      name: 'Combobox',
      path: '/forms/combobox',
      keys: 'Up or Down opens the list, arrow keys move through the options, Enter or Space selects one and Escape closes the list. The list is a single Tab stop.',
    },
    {
      name: 'Datepicker',
      path: '/forms/datepicker',
      keys: 'Arrow keys move by day and week, Home and End go to the start and end of the week, Page Up and Page Down change the month, and Escape closes the calendar.',
    },
    {
      name: 'Chips',
      path: '/forms/chips',
      keys: 'Enter adds a chip, and Backspace in the empty field moves to the last chip. Left and Right move between chips, Home and End go to the first and last, and Backspace or Delete removes the focused chip.',
    },
  ];

  protected readonly visuallyHidden = `<p class="fg-danger">
  <span class="visually-hidden">Danger: </span>
  This action is not reversible
</p>`;

  protected readonly skipLink = `<a class="visually-hidden-focusable" href="#content">Skip to main content</a>`;

  protected readonly labels = `<button type="button" bsCloseButton aria-label="Close"></button>
<bs-progress [value]="60" aria-label="Upload progress" />
<div bsCarousel aria-label="Featured products">…</div>`;

  protected readonly announcer = `import { BsLiveAnnouncer } from 'bootstrap-ng';

export class SearchResults {
  private readonly announcer = inject(BsLiveAnnouncer);

  protected onResults(count: number): void {
    this.announcer.announce(\`\${count} results found\`);
  }
}`;
}
