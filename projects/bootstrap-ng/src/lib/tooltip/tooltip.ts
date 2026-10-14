import { Directive, input } from '@angular/core';
import { BsFloatingTip, BsTipContent } from './floating-tip';

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
