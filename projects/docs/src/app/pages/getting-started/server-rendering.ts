import { DocsHeading } from '../../shared/heading';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../../shared/code';

@Component({
  selector: 'docs-server-rendering',
  imports: [DocsCode, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './server-rendering.html',
})
export default class ServerRendering {
  protected readonly addSsr = `ng add @angular/ssr`;

  protected readonly hydration = `import { ApplicationConfig } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideClientHydration(withEventReplay())],
};`;

  protected readonly browserOnly = `import { afterNextRender, Component, inject } from '@angular/core';
import { BsToaster } from 'bootstrap-ng';

@Component({ … })
export class Welcome {
  private readonly toaster = inject(BsToaster);

  constructor() {
    // Runs in the browser only, after the first render.
    afterNextRender(() => {
      this.toaster.show({ body: 'Welcome back!' });
    });
  }
}`;
}
