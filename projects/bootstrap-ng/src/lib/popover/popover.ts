import { Directive, input } from '@angular/core';
import { BsFloatingTip, BsTipContent } from '../tooltip/floating-tip';

/**
 * Popover with an optional header, toggled by clicking its trigger. Takes plain text or
 * templates for the title and body.
 *
 * ```html
 * <button bsButton bsPopover="And here’s some amazing content." popoverTitle="Popover title">
 *   Toggle popover
 * </button>
 * ```
 */
@Directive({
  selector: '[bsPopover]',
  exportAs: 'bsPopover',
})
export class BsPopover extends BsFloatingTip {
  /** Text or template shown in the popover body. */
  readonly content = input<BsTipContent>(undefined, { alias: 'bsPopover' });
  /** Text or template shown in the popover header. The header is left out when empty. */
  readonly popoverTitle = input<BsTipContent>(undefined);

  protected readonly name = 'popover';
  protected readonly defaultTrigger = 'click';
  protected readonly offset = 8;

  protected readContent(): unknown {
    return [this.content(), this.popoverTitle()];
  }

  protected hasContent(): boolean {
    return Boolean(this.content()) || Boolean(this.popoverTitle());
  }

  protected buildContent(): Node[] {
    const arrow = this.document.createElement('div');
    arrow.className = 'popover-arrow';
    const nodes: Node[] = [arrow];

    if (this.popoverTitle()) {
      const header = this.document.createElement('h3');
      header.className = 'popover-header';
      header.append(...this.renderContent(this.popoverTitle()));
      nodes.push(header);
    }
    if (this.content()) {
      const body = this.document.createElement('div');
      body.className = 'popover-body';
      body.append(...this.renderContent(this.content()));
      nodes.push(body);
    }
    return nodes;
  }
}
