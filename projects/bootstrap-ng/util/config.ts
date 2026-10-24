import { inject, InjectionToken, Provider } from '@angular/core';

/** Creates the token that holds a component's defaults. Without a provider it is `{}`. */
export function configToken<T>(name: string): InjectionToken<Partial<T>> {
  return new InjectionToken<Partial<T>>(name, { providedIn: 'root', factory: () => ({}) });
}

/**
 * Provides `config` for `token`, merged over the config of the parent injector, so a
 * component's `providers` can change some defaults and keep the app's others.
 */
export function provideConfig<T>(token: InjectionToken<Partial<T>>, config: Partial<T>): Provider {
  return {
    provide: token,
    // The root injector's parent has no config, since root tokens are only created in the root.
    useFactory: () => ({ ...inject(token, { skipSelf: true, optional: true }), ...config }),
  };
}
