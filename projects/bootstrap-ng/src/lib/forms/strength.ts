import {
  afterEveryRender,
  Component,
  computed,
  effect,
  input,
  numberAttribute,
  signal,
} from '@angular/core';

/** A password strength level. */
export type BsStrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

const LEVELS: BsStrengthLevel[] = ['weak', 'fair', 'good', 'strong'];

const TEXT_COLORS: Record<BsStrengthLevel, string> = {
  weak: 'danger',
  fair: 'warning',
  good: 'info',
  strong: 'success',
};

/** Points given for each criterion of the default password scoring. Set one to 0 to skip it. */
export interface BsStrengthWeights {
  minLength: number;
  extraLength: number;
  lowercase: number;
  uppercase: number;
  numbers: number;
  special: number;
  multipleSpecial: number;
  longPassword: number;
}

const DEFAULT_WEIGHTS: BsStrengthWeights = {
  minLength: 1,
  extraLength: 1,
  lowercase: 1,
  uppercase: 1,
  numbers: 1,
  special: 1,
  multipleSpecial: 1,
  longPassword: 1,
};

const DEFAULT_MESSAGES: Record<BsStrengthLevel, string> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

const SPECIAL = /[!@#$%^&*(),.?":{}|<>]/;
const MULTIPLE_SPECIAL = /[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/;

/** Scores a password like Bootstrap's strength meter: a point per criterion met. */
export function passwordScore(
  password: string,
  minLength = 8,
  weights: Partial<BsStrengthWeights> = {},
): number {
  if (!password) {
    return 0;
  }
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  const checks: [boolean, number][] = [
    [password.length >= minLength, w.minLength],
    [password.length >= minLength + 4, w.extraLength],
    [/[a-z]/.test(password), w.lowercase],
    [/[A-Z]/.test(password), w.uppercase],
    [/\d/.test(password), w.numbers],
    [SPECIAL.test(password), w.special],
    [MULTIPLE_SPECIAL.test(password), w.multipleSpecial],
    [password.length >= 16, w.longPassword],
  ];
  return checks.reduce((score, [met, points]) => score + (met ? points : 0), 0);
}

/**
 * A password strength meter, as four segments or a single bar. Point it at a password
 * input with `[input]`, or pass the password with `[password]`, and it scores it as the
 * user types. For a static meter, set the level: `bsStrength="good"`.
 *
 * Pair it with a `bsStrengthText` element to show and announce the level.
 *
 * ```html
 * <input #password type="password" bsFormControl [formControl]="pw" />
 * <div bsStrength #strength="bsStrength" [input]="password"></div>
 * <span [bsStrengthText]="strength"></span>
 * ```
 */
@Component({
  selector: 'div[bsStrength]',
  exportAs: 'bsStrength',
  template: `
    @if (variant() === 'segments') {
      @for (level of levels; track level) {
        <div class="strength-segment" [class.active]="$index <= index()"></div>
      }
    }
  `,
  host: {
    role: 'meter',
    'aria-valuemin': '0',
    'aria-valuemax': '4',
    '[class.strength]': 'variant() === "segments"',
    '[class.strength-bar]': 'variant() === "bar"',
    '[attr.data-bs-strength]': 'strength()',
    '[attr.aria-valuenow]': 'index() + 1',
    '[attr.aria-valuetext]': 'message() || null',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class BsStrength {
  /** A fixed level, for a static meter. Leave empty to score a password. */
  readonly level = input<BsStrengthLevel | '' | null>(null, { alias: 'bsStrength' });
  /** Four segments, or a single bar. */
  readonly variant = input<'segments' | 'bar'>('segments');
  /** Password input to score as the user types. */
  readonly input = input<HTMLInputElement | null>(null);
  /** Password to score. Takes precedence over `input`. */
  readonly password = input<string | null>(null);
  /** Minimum length that earns the first point. */
  readonly minLength = input(8, { transform: numberAttribute });
  /** Points per criterion of the default scoring. */
  readonly weights = input<Partial<BsStrengthWeights>>({});
  /** Highest scores that count as weak, fair and good. Higher scores are strong. */
  readonly thresholds = input<[number, number, number]>([2, 4, 6]);
  /** Custom scoring, which replaces the default criteria. */
  readonly scorer = input<((password: string) => number) | null>(null);
  /** Text for each level. */
  readonly messages = input<Partial<Record<BsStrengthLevel, string>>>({});
  /** Accessible name of the meter. */
  readonly ariaLabel = input('Password strength', { alias: 'aria-label' });

  protected readonly levels = LEVELS;
  private readonly typed = signal('');

  /** The scored password. */
  readonly value = computed(() => this.password() ?? this.typed());

  /** The password's score. */
  readonly score = computed(() => {
    const password = this.value();
    const scorer = this.scorer();
    if (!password) {
      return 0;
    }
    return scorer ? scorer(password) : passwordScore(password, this.minLength(), this.weights());
  });

  /** The strength level, or `null` for an empty password. */
  readonly strength = computed<BsStrengthLevel | null>(() => {
    const level = this.level();
    if (level) {
      return level;
    }
    const score = this.score();
    if (score <= 0) {
      return null;
    }
    const [weak, fair, good] = this.thresholds();
    return score <= weak ? 'weak' : score <= fair ? 'fair' : score <= good ? 'good' : 'strong';
  });

  /** The message for the current level, or an empty string. */
  readonly message = computed(() => {
    const strength = this.strength();
    return strength ? { ...DEFAULT_MESSAGES, ...this.messages() }[strength] : '';
  });

  protected readonly index = computed(() => {
    const strength = this.strength();
    return strength ? LEVELS.indexOf(strength) : -1;
  });

  constructor() {
    effect((onCleanup) => {
      const element = this.input();
      if (!element) {
        return;
      }
      const update = () => this.typed.set(element.value);
      update();
      element.addEventListener('input', update);
      onCleanup(() => element.removeEventListener('input', update));
    });
    // Forms write the value without an input event, as with `reset()` and `setValue()`.
    afterEveryRender({
      read: () => {
        const element = this.input();
        if (element) {
          this.typed.set(element.value);
        }
      },
    });
  }
}

/**
 * Shows the level of a `bsStrength` meter as text, in the level's color, and announces
 * changes to screen readers.
 */
@Component({
  selector: '[bsStrengthText]',
  template: '{{ meter().message() }}',
  host: {
    class: 'strength-text',
    'aria-live': 'polite',
    '[attr.data-bs-strength]': 'meter().strength()',
    '[style.--bs-strength-color]': 'color()',
  },
})
export class BsStrengthText {
  /** The meter to describe. */
  readonly meter = input.required<BsStrength>({ alias: 'bsStrengthText' });

  protected readonly color = computed(() => {
    const strength = this.meter().strength();
    return strength ? `var(--bs-${TEXT_COLORS[strength]}-fg-emphasis)` : null;
  });
}
