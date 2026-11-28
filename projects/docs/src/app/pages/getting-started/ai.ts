import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../../shared/code';
import { DocsHeading } from '../../shared/heading';

@Component({
  selector: 'docs-ai',
  imports: [DocsCode, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai.html',
})
export default class Ai {
  protected readonly prompt =
    'Read https://bootstrap-ng.com/llms.txt so I can ask questions about bootstrap-ng.';

  protected readonly skills = 'npx skills add bootstrap-ng/bootstrap-ng';

  protected readonly agentsMd = `## UI components
- Use bootstrap-ng (https://bootstrap-ng.com/llms.txt) for Bootstrap 6 components.
- Load Bootstrap's CSS only. Never add Bootstrap's JavaScript: bootstrap-ng implements all behavior in Angular.
- Import single components, such as BsButton from 'bootstrap-ng/button', not BOOTSTRAP_NG.`;
}
