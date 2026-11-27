import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../../shared/code';
import { DocsHeading } from '../../shared/heading';

@Component({
  selector: 'docs-content-security-policy',
  imports: [DocsCode, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content-security-policy.html',
})
export default class ContentSecurityPolicy {
  protected readonly policy = `Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-RANDOM';
  style-src 'self' 'nonce-RANDOM' https://cdn.jsdelivr.net;
  style-src-attr 'unsafe-inline';
  connect-src 'self' https://cdn.jsdelivr.net;
  img-src 'self' data:;
  object-src 'none';
  base-uri 'self'`;

  protected readonly nonceAttribute = `<body>
  <app-root ngCspNonce="RANDOM"></app-root>
</body>`;

  protected readonly nonceToken = `import { ApplicationConfig, CSP_NONCE } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [{ provide: CSP_NONCE, useValue: globalThis.myRandomNonceValue }],
};`;

  protected readonly autoCsp = `{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "security": { "autoCsp": true }
          }
        }
      }
    }
  }
}`;
}
