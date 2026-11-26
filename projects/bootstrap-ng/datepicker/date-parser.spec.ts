import { parseFormattedDate } from './date-parser';

describe('parseFormattedDate', () => {
  const numeric: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };

  it.each([
    ['ja-JP', numeric, '2026/11/27'],
    ['ja-JP', numeric, '2026/1/5', '2026-01-05'],
    ['ja-JP', numeric, '２０２６／１１／２７'],
    ['en-US', numeric, '11/27/2026'],
    ['en-GB', numeric, '27/11/2026'],
    ['de-DE', numeric, '27.11.2026'],
    ['de-DE', numeric, '27. 11. 2026'],
    ['en-US', { dateStyle: 'short' }, '11/27/26'],
    ['en-US', { dateStyle: 'medium' }, 'Nov 27, 2026'],
    ['en-US', { dateStyle: 'medium' }, 'november 27, 2026'],
    ['en-US', { dateStyle: 'long' }, 'November 27, 2026'],
    ['en-US', { dateStyle: 'full' }, 'Friday, November 27, 2026'],
    ['de-DE', { dateStyle: 'long' }, '27. November 2026'],
    ['fr-FR', { dateStyle: 'medium' }, '27 nov. 2026'],
    ['ja-JP', { dateStyle: 'long' }, '2026年11月27日'],
    ['ar-EG', numeric, '٢٧/١١/٢٠٢٦'],
    ['ja-JP', { calendar: 'japanese', dateStyle: 'long' }, '令和8年11月27日'],
    ['ja-JP', { calendar: 'japanese', dateStyle: 'long' }, '平成31年4月30日', '2019-04-30'],
    ['ja-JP', { calendar: 'japanese', dateStyle: 'long' }, '令和元年5月1日', '2019-05-01'],
    ['th-TH', { calendar: 'buddhist', ...numeric }, '27/11/2569'],
  ] as [string, Intl.DateTimeFormatOptions, string, string?][])(
    'reads %s %j text %s',
    (...[locale, options, text, iso = '2026-11-27']) => {
      expect(parseFormattedDate(text, locale, options)).toBe(iso);
    },
  );

  it('round-trips what Intl formats', () => {
    const date = new Date(2026, 1, 3);
    for (const [locale, options] of [
      ['en-US', { dateStyle: 'medium' }],
      ['ko-KR', { dateStyle: 'long' }],
      [
        'ja-JP',
        { calendar: 'japanese', era: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      ],
      ['zh-CN', numeric],
      ['nl-NL', { dateStyle: 'full' }],
    ] as [string, Intl.DateTimeFormatOptions][]) {
      const text = new Intl.DateTimeFormat(locale, options).format(date);
      expect(parseFormattedDate(text, locale, options), `${locale} ${text}`).toBe('2026-02-03');
    }
  });

  it.each([
    ['en-US', numeric, '13/27/2026'],
    ['en-US', numeric, '2/30/2026'],
    ['en-US', numeric, '11/27'],
    ['en-US', numeric, 'tomorrow'],
    ['en-US', { dateStyle: 'medium' }, 'Foo 27, 2026'],
    ['en-US', { year: 'numeric', month: 'numeric' }, '11/2026'],
    ['en-US', { ...numeric, hour: 'numeric' }, '11/27/2026, 3 PM'],
    ['en-US', { calendar: 'islamic', ...numeric }, '5/16/1448'],
  ] as [string, Intl.DateTimeFormatOptions, string][])(
    'rejects %s %j text %s',
    (locale, options, text) => {
      expect(parseFormattedDate(text, locale, options)).toBeNull();
    },
  );
});
