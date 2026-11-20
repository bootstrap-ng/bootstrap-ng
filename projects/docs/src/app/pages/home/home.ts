import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BsBadge, BsButton, BsMenu, BsMenuToggle } from 'bootstrap-ng';
import { DocsCopyButton } from '../../shared/copy-button';

@Component({
  selector: 'docs-home',
  imports: [RouterLink, BsButton, BsBadge, BsMenu, BsMenuToggle, DocsCopyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-block mx-auto px-5 py-12' },
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class Home {
  protected readonly install = 'npm i bootstrap-ng bootstrap@next @floating-ui/dom';

  /** Chat apps that open with a prompt to read llms.txt, like the "For Agents" menu on getbootstrap.com. */
  protected readonly agents = [
    { name: 'ChatGPT', url: 'https://chatgpt.com/' },
    { name: 'Claude', url: 'https://claude.ai/new' },
  ].map(({ name, url }) => ({ name, href: `${url}?q=${encodeURIComponent(PROMPT)}` }));
}

const PROMPT = 'Read https://bootstrap-ng.com/llms.txt so I can ask questions about bootstrap-ng.';
