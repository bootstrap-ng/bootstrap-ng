import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BsBadge, BsButton, BsMenu, BsMenuToggle, BsToaster } from 'bootstrap-ng';
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
  private readonly toaster = inject(BsToaster);

  protected readonly install = 'npm i bootstrap-ng bootstrap@next @floating-ui/dom';

  /** Chat apps that open with a prompt to read llms.txt, like the "For Agents" menu on getbootstrap.com. */
  protected readonly agents = [
    { name: 'ChatGPT', url: 'https://chatgpt.com/' },
    { name: 'Claude', url: 'https://claude.ai/new' },
  ].map(({ name, url }) => ({ name, href: `${url}?q=${encodeURIComponent(PROMPT)}` }));

  /** Copies the Skills CLI command that installs the agent skills in `skills/`, like Bootstrap's own homepage. */
  protected async copySkill(): Promise<void> {
    // `navigator.clipboard` is undefined outside secure contexts, despite its type.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    await navigator.clipboard?.writeText('npx skills add bootstrap-ng/bootstrap-ng');
    this.toaster.show({ body: 'Copied the install command to the clipboard.' });
  }
}

const PROMPT = 'Read https://bootstrap-ng.com/llms.txt so I can ask questions about bootstrap-ng.';
