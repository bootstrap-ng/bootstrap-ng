import { Directive, inject, input, Provider } from '@angular/core';
import { configToken, provideConfig } from '../util/config';
import { BsFloatingTip, BsTipConfig, BsTipContent } from './floating-tip';

/** The defaults set with `provideBsTooltipConfig()`. */
export const BS_TOOLTIP_CONFIG = configToken<BsTipConfig>('BS_TOOLTIP_CONFIG');

/**
 * Sets defaults for the inputs of tooltips, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsTooltipConfig({ placement: 'bottom', delay: 300 })]
 * ```
 */
export function provideBsTooltipConfig(config: Partial<BsTipConfig>): Provider {
  return provideConfig(BS_TOOLTIP_CONFIG, config);
}

/**
 * Tooltip shown on hover and focus. Takes plain text or a template.
 *
 * ```html
 * <button bsButton bsTooltip="Saves your changes" placement="bottom">Save</button>
 * ```
 */
@Directive({
  selector: '[bsTooltip]',
  exportAs: 'bsTooltip',
})
export class BsTooltip extends BsFloatingTip {
  /** Text or template shown in the tooltip. Nothing is shown when it is empty. */
  readonly content = input<BsTipContent>(undefined, { alias: 'bsTooltip' });

  protected readonly name = 'tooltip';
  protected readonly defaultTrigger = 'hover focus';
  protected readonly offset = 6;

  protected injectConfig(): Partial<BsTipConfig> {
    return inject(BS_TOOLTIP_CONFIG);
  }

  protected readContent(): unknown {
    return this.content();
  }

  protected hasContent(): boolean {
    return Boolean(this.content());
  }

  protected buildContent(): Node[] {
    const arrow = this.document.createElement('div');
    arrow.className = 'tooltip-arrow';
    const inner = this.document.createElement('div');
    inner.className = 'tooltip-inner';
    inner.append(...this.renderContent(this.content()));
    return [arrow, inner];
  }
}
