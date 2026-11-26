import { parseIsoDate } from 'bootstrap-ng/calendar';

type DateField = 'year' | 'month' | 'day' | 'era';

/** How to read text in the format that some `Intl.DateTimeFormat` options show dates in. */
interface DatePattern {
  regex: RegExp;
  /** The field of each capture group of `regex`, in order. */
  fields: DateField[];
  /** Month names, lowercased, by month number (1 to 12). */
  months: Map<string, number>;
  /** The Gregorian year minus the calendar's year, by era name ('' when there is none). */
  eras: Map<string, number>;
  /** The locale's own digits, such as Arabic-Indic, mapped to ASCII digits. */
  digits: Map<string, string>;
  twoDigitYear: boolean;
  locale: string;
}

/** Calendars whose months and days are the Gregorian ones, so only years differ. */
const GREGORIAN_MONTH_CALENDARS = new Set(['buddhist', 'gregory', 'iso8601', 'japanese', 'roc']);
const SUPPORTED_PARTS = new Set(['day', 'era', 'literal', 'month', 'weekday', 'year']);

const cache = new Map<string, DatePattern | null>();

/**
 * Reads a date typed in the format that `Intl.DateTimeFormat` shows with `options`, such
 * as `2026/11/27`, `Nov 27, 2026` or `令和8年11月27日`, and returns it as `YYYY-MM-DD`.
 * Returns null for text it can't read, and for formats with times or with calendars whose
 * months aren't the Gregorian ones.
 */
export function parseFormattedDate(
  text: string,
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): string | null {
  const key = JSON.stringify([locale, options]);
  let pattern = cache.get(key);
  if (pattern === undefined) {
    pattern = buildPattern(locale, options);
    cache.set(key, pattern);
  }
  return pattern ? readDate(pattern, text) : null;
}

function readDate(pattern: DatePattern, text: string): string | null {
  const match = pattern.regex.exec(toAscii(text, pattern.digits));
  if (!match) {
    return null;
  }
  let year = NaN;
  let month = NaN;
  let day = NaN;
  let era = '';
  pattern.fields.forEach((field, i) => {
    const value = match[i + 1] ?? '';
    if (field === 'era') {
      era = value.toLocaleLowerCase(pattern.locale);
    } else if (field === 'month') {
      month = /^\d+$/.test(value)
        ? Number(value)
        : (pattern.months.get(value.toLocaleLowerCase(pattern.locale)) ?? NaN);
    } else if (field === 'day') {
      day = Number(value);
    } else {
      // 元年 is the first year of a Japanese era.
      year = value === '元' ? 1 : Number(value);
      if (pattern.twoDigitYear && value.length <= 2) {
        year = expandTwoDigitYear(year);
      }
    }
  });
  year += pattern.eras.get(era) ?? NaN;
  if (!(year >= 1 && year <= 9999)) {
    return null;
  }
  const iso = `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
  return parseIsoDate(iso) ? iso : null;
}

function buildPattern(
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): DatePattern | null {
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat(locale, options);
  } catch {
    return null;
  }
  const resolved = formatter.resolvedOptions();
  const sample = formatter.formatToParts(new Date(2026, 10, 27));
  const types = new Set(sample.map((part) => part.type));
  const required = ['year', 'month', 'day'] as const;
  if (
    !GREGORIAN_MONTH_CALENDARS.has(resolved.calendar) ||
    required.some((type) => !types.has(type)) ||
    [...types].some((type) => !SUPPORTED_PARTS.has(type))
  ) {
    return null;
  }
  const digits = localDigits(resolved);
  const months = monthNames(formatter, digits);
  const eras = eraOffsets(formatter, digits, types.has('era'));
  const year = toAscii(sample.find((part) => part.type === 'year')?.value ?? '', digits);
  const { source, fields } = patternSource(sample, {
    weekdays: weekdayNames(formatter),
    eras: new Set(eras.keys()),
    months: new Set(months.keys()),
  });
  return {
    regex: new RegExp(`^\\s*${source}\\s*$`, 'iu'),
    fields,
    months,
    eras,
    digits,
    twoDigitYear: resolved.calendar === 'gregory' && year === '26',
    locale: resolved.locale,
  };
}

/** The regular expression source that matches the parts, and the field of each group. */
function patternSource(
  sample: Intl.DateTimeFormatPart[],
  names: { weekdays: Set<string>; eras: Set<string>; months: Set<string> },
): { source: string; fields: DateField[] } {
  const fields: DateField[] = [];
  let source = '';
  for (const part of sample) {
    if (part.type === 'literal') {
      const literal = normalize(part.value).trim();
      source += literal ? `\\s*${escape(literal).replace(/\s+/g, '\\s*')}\\s*` : '\\s*';
    } else if (part.type === 'weekday') {
      source += `(?:${alternatives(names.weekdays)})`;
    } else if (part.type === 'era') {
      fields.push('era');
      source += `(${alternatives(names.eras)})`;
    } else if (part.type === 'month') {
      fields.push('month');
      source += names.months.size ? `(\\d{1,2}|${alternatives(names.months)})` : '(\\d{1,2})';
    } else {
      fields.push(part.type as DateField);
      source += part.type === 'year' ? '(\\d{1,4}|元)' : '(\\d{1,2})';
    }
  }
  return { source, fields };
}

/** The locale's own digits, such as Arabic-Indic ones, mapped to ASCII digits. */
function localDigits(resolved: Intl.ResolvedDateTimeFormatOptions): Map<string, string> {
  const digits = new Map<string, string>();
  const format = new Intl.NumberFormat(resolved.locale, {
    numberingSystem: resolved.numberingSystem,
  });
  for (let digit = 0; digit <= 9; digit++) {
    const local = format.format(digit);
    if (local !== String(digit)) {
      digits.set(local, String(digit));
    }
  }
  return digits;
}

/** Month names in the format's own style, and long and short ones, which are easier to type. */
function monthNames(
  formatter: Intl.DateTimeFormat,
  digits: Map<string, string>,
): Map<string, number> {
  const { locale, calendar, numberingSystem } = formatter.resolvedOptions();
  const months = new Map<string, number>();
  const formatters = [
    formatter,
    ...(['long', 'short'] as const).map(
      (month) =>
        new Intl.DateTimeFormat(locale, { calendar, numberingSystem, day: 'numeric', month }),
    ),
  ];
  for (const format of formatters) {
    for (let month = 0; month < 12; month++) {
      const parts = format.formatToParts(new Date(2026, month, 15));
      const name = parts.find((part) => part.type === 'month')?.value;
      if (name && !/^\d+$/.test(toAscii(name, digits))) {
        months.set(normalize(name).toLocaleLowerCase(locale), month + 1);
      }
    }
  }
  return months;
}

function weekdayNames(formatter: Intl.DateTimeFormat): Set<string> {
  const weekdays = new Set<string>();
  for (let day = 22; day < 29; day++) {
    const parts = formatter.formatToParts(new Date(2026, 10, day));
    const name = parts.find((part) => part.type === 'weekday')?.value;
    if (name) {
      weekdays.add(normalize(name));
    }
  }
  return weekdays;
}

/**
 * The Gregorian year minus the calendar's year, by lowercased era name ('' when the format
 * has no era). Calendars other than the Gregorian count years differently, so this scans
 * the years since the Meiji era.
 */
function eraOffsets(
  formatter: Intl.DateTimeFormat,
  digits: Map<string, string>,
  hasEra: boolean,
): Map<string, number> {
  const { locale, calendar } = formatter.resolvedOptions();
  const eras = new Map<string, number>();
  if (!hasEra && (calendar === 'gregory' || calendar === 'iso8601')) {
    eras.set('', 0);
    return eras;
  }
  for (let year = 1868; year <= 2200; year++) {
    const parts = formatter.formatToParts(new Date(year, 6, 1));
    const era = normalize(parts.find((part) => part.type === 'era')?.value ?? '');
    const calendarYear = toAscii(parts.find((part) => part.type === 'year')?.value ?? '', digits);
    eras.set(era.toLocaleLowerCase(locale), year - Number(calendarYear));
  }
  return eras;
}

/** Normalizes the text and replaces the locale's own digits with ASCII ones. */
function toAscii(value: string, digits: Map<string, string>): string {
  return normalize(value).replace(/\p{Nd}/gu, (digit) => digits.get(digit) ?? digit);
}

/** Normalizes full-width characters, and spaces such as U+202F, so they match typed text. */
function normalize(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u061c\u200e\u200f]/g, '')
    .replace(/\s/g, ' ');
}

function escape(value: string): string {
  return value.replace(/[\\^$.*+?()[\]{}|/]/g, '\\$&');
}

/** A regular expression alternation of the values, longest first. */
function alternatives(values: Set<string>): string {
  return [...values]
    .filter((value) => value)
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join('|');
}

/** Reads a two-digit year as the year ending in those digits within 80 years before or 20 after today. */
function expandTwoDigitYear(year: number): number {
  const now = new Date().getFullYear();
  const expanded = now - (now % 100) + year;
  return expanded > now + 20 ? expanded - 100 : expanded;
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0');
}
