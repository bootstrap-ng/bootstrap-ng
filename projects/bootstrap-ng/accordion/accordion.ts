import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  Provider,
} from '@angular/core';
import { BsTheme, configToken, provideConfig, themeClass, uniqueId } from 'bootstrap-ng/util';

/** Defaults for the inputs of accordions. Inputs set on a component win over them. */
export interface BsAccordionConfig {
  /** Accordion size. */
  size: 'sm' | 'md';
  /** Removes the outer borders and rounded corners. */
  flush: boolean;
  /** Allows only one item to be open at a time. */
  exclusive: boolean;
}

/** The defaults set with `provideBsAccordionConfig()`. */
export const BS_ACCORDION_CONFIG = configToken<BsAccordionConfig>('BS_ACCORDION_CONFIG');

/**
 * Sets defaults for the inputs of accordions, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsAccordionConfig({ exclusive: false })]
 * ```
 */
export function provideBsAccordionConfig(config: Partial<BsAccordionConfig>): Provider {
  return provideConfig(BS_ACCORDION_CONFIG, config);
}

/**
 * Accordion built on native `<details>` and `<summary>` elements. The browser handles
 * opening and closing, so no JavaScript runs for the core behavior.
 *
 * ```html
 * <div bsAccordion>
 *   <details bsAccordionItem open>
 *     <summary bsAccordionHeader>Item #1</summary>
 *     <div bsAccordionBody>Content</div>
 *   </details>
 * </div>
 * ```
 */
@Directive({
  selector: '[bsAccordion]',
  exportAs: 'bsAccordion',
  host: {
    class: 'accordion',
    '[class]': 'classes()',
  },
})
export class BsAccordion {
  private readonly config = inject(BS_ACCORDION_CONFIG);
  /** Theme color of open items. */
  readonly theme = input<BsTheme | null>(null);
  /** Accordion size. */
  readonly size = input<'sm' | 'md'>(this.config.size ?? 'md');
  /** Removes the outer borders and rounded corners. */
  readonly flush = input(this.config.flush ?? false, { transform: booleanAttribute });
  /** Allows only one item to be open at a time. */
  readonly exclusive = input(this.config.exclusive ?? true, { transform: booleanAttribute });
  /** Group name shared by the `<details>` elements. Generated when not set. */
  readonly name = input(uniqueId('bs-accordion'));

  protected readonly classes = computed(() =>
    [
      themeClass(this.theme()),
      this.size() === 'sm' ? 'accordion-sm' : '',
      this.flush() ? 'accordion-flush' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}

/** One collapsible item of a `bsAccordion`. Apply it to a `<details>` element. */
@Directive({
  selector: 'details[bsAccordionItem]',
  exportAs: 'bsAccordionItem',
  host: {
    class: 'accordion-item',
    '[attr.name]': 'groupName()',
    '[open]': 'isOpen()',
    '(toggle)': 'onToggle()',
  },
})
export class BsAccordionItem {
  private readonly element = inject<ElementRef<HTMLDetailsElement>>(ElementRef).nativeElement;
  private readonly accordion = inject(BsAccordion, { optional: true });

  /** Whether the item is open. Supports two-way binding with `[(open)]`. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- `open` state pattern, see AGENTS.md
  readonly openInput = input(false, { alias: 'open', transform: booleanAttribute });
  /** Emits the new open state when it changes from inside the item. */
  readonly openChange = output<boolean>();
  private readonly openState = linkedSignal(() => this.openInput());
  /** Current open state. */
  readonly isOpen = this.openState.asReadonly();

  protected readonly groupName = computed(() =>
    this.accordion?.exclusive() ? this.accordion.name() : null,
  );

  show(): void {
    this.setOpen(true);
  }

  hide(): void {
    this.setOpen(false);
  }

  toggle(): void {
    this.setOpen(!this.isOpen());
  }

  private setOpen(open: boolean): void {
    if (this.openState() !== open) {
      this.openState.set(open);
      this.openChange.emit(open);
    }
  }

  protected onToggle(): void {
    // Sync with the browser, which also closes other items in an exclusive group.
    this.setOpen(this.element.open);
  }
}

/** Header of an accordion item. Apply it to the `<summary>` element. */
@Component({
  selector: 'summary[bsAccordionHeader]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    <svg
      class="accordion-icon"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true">
      <path d="m2 5 6 6 6-6" />
    </svg>
  `,
  host: { class: 'accordion-header' },
})
export class BsAccordionHeader {}

/** Body of an accordion item. */
@Directive({
  selector: '[bsAccordionBody]',
  host: { class: 'accordion-body' },
})
export class BsAccordionBody {}

/** The accordion directives, to add to `imports` together. */
export const BS_ACCORDION = [
  BsAccordion,
  BsAccordionItem,
  BsAccordionHeader,
  BsAccordionBody,
] as const;
