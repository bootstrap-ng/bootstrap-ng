import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsIcon } from './icon';
import {
  bootstrapIcons,
  BsIconRegistry,
  fontAwesomeIcons,
  materialSymbols,
  modusIcons,
  phosphorIcons,
  provideBsIcons,
} from './icon-registry';

const svgUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** A test library whose icons are data URLs: the name is the SVG's path data. */
const testLibrary = {
  resolver: (name: string, variant: string | null) =>
    svgUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-variant="${variant ?? ''}"><path d="${name}"/></svg>`,
    ),
};

@Component({
  imports: [BsIcon],
  template: `
    <bs-icon
      [name]="name()"
      [library]="library()"
      [variant]="variant()"
      [src]="src()"
      [label]="label()"
      (loaded)="loads = loads + 1"
      (loadError)="error = $event" />
  `,
})
class Host {
  readonly name = signal<string | null>('M0 0h16v16H0z');
  readonly library = signal<string | null>('test');
  readonly variant = signal<string | null>(null);
  readonly src = signal<string | null>(null);
  readonly label = signal<string | null>(null);
  loads = 0;
  error: unknown = null;
}

async function setup(config?: Parameters<typeof provideBsIcons>[0]) {
  TestBed.configureTestingModule({ providers: config ? [provideBsIcons(config)] : [] });
  TestBed.inject(BsIconRegistry).register('test', testLibrary);
  const fixture = TestBed.createComponent(Host);
  const icon: HTMLElement = fixture.nativeElement.querySelector('bs-icon');
  const settle = async () => {
    await fixture.whenStable();
    fixture.detectChanges();
  };
  await settle();
  return { fixture, host: fixture.componentInstance, icon, settle };
}

describe('BsIcon', () => {
  it('inlines the SVG of a named icon, sized and colored by the text', async () => {
    const { host, icon } = await setup();
    const svg = icon.querySelector('svg')!;
    expect(svg.querySelector('path')!.getAttribute('d')).toBe('M0 0h16v16H0z');
    expect(svg.getAttribute('width')).toBe('100%');
    expect(svg.getAttribute('height')).toBe('100%');
    expect(svg.getAttribute('fill')).toBe('currentColor');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(icon).display).toBe('inline-flex');
    expect(host.loads).toBe(1);
  });

  it('is decorative without a label and an image with one', async () => {
    const { host, icon, settle } = await setup();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.hasAttribute('role')).toBe(false);
    host.label.set('Favorite');
    await settle();
    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Favorite');
    expect(icon.hasAttribute('aria-hidden')).toBe(false);
  });

  it('passes the variant to the library and swaps icons when inputs change', async () => {
    const { host, icon, settle } = await setup();
    host.variant.set('outlined');
    host.name.set('M1 1h2');
    await settle();
    const svg = icon.querySelector('svg')!;
    expect(svg.dataset['variant']).toBe('outlined');
    expect(svg.querySelector('path')!.getAttribute('d')).toBe('M1 1h2');
    expect(icon.querySelectorAll('svg').length).toBe(1);
  });

  it('shows an SVG from src, keeping its own fill', async () => {
    const { host, icon, settle } = await setup();
    host.src.set(
      svgUrl('<svg xmlns="http://www.w3.org/2000/svg" fill="none"><circle r="1"/></svg>'),
    );
    await settle();
    const svg = icon.querySelector('svg')!;
    expect(svg.querySelector('circle')).not.toBeNull();
    expect(svg.getAttribute('fill')).toBe('none');
  });

  it('removes scripts and event handlers from loaded SVGs', async () => {
    const { host, icon, settle } = await setup();
    host.src.set(
      svgUrl(
        '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)"><path onclick="alert(4)" d="M0 0"/></a></svg>',
      ),
    );
    await settle();
    const svg = icon.querySelector('svg')!;
    expect(svg.hasAttribute('onload')).toBe(false);
    expect(svg.querySelector('script')).toBeNull();
    expect(svg.querySelector('a')!.hasAttribute('href')).toBe(false);
    expect(svg.querySelector('path')!.hasAttribute('onclick')).toBe(false);
  });

  it('emits loadError and shows nothing when the icon fails to load', async () => {
    const { host, icon, settle } = await setup();
    host.src.set('data:text/plain,not-an-svg');
    await settle();
    expect(icon.querySelector('svg')).toBeNull();
    expect(String(host.error)).toContain('is not an SVG');

    host.src.set(null);
    host.library.set('nope');
    await settle();
    expect(String(host.error)).toContain('Unknown icon library "nope"');
  });

  it('shows nothing without a name or src', async () => {
    const { host, icon, settle } = await setup();
    host.name.set(null);
    await settle();
    expect(icon.childElementCount).toBe(0);
  });

  it('uses the default library from provideBsIcons', async () => {
    const custom = {
      resolver: () =>
        svgUrl('<svg xmlns="http://www.w3.org/2000/svg"><rect class="custom"/></svg>'),
    };
    const { host, icon, settle } = await setup({
      defaultLibrary: 'custom',
      libraries: { custom },
    });
    host.library.set(null);
    await settle();
    expect(icon.querySelector('rect.custom')).not.toBeNull();
    expect(TestBed.inject(BsIconRegistry).defaultLibrary()).toBe('custom');
  });
});

describe('BsIconRegistry', () => {
  it('fetches each URL once and returns copies', async () => {
    const registry = TestBed.inject(BsIconRegistry);
    const url = svgUrl('<svg xmlns="http://www.w3.org/2000/svg"/>');
    const fetchSpy = vi.spyOn(window, 'fetch');
    const [first, second] = await Promise.all([registry.load(url), registry.load(url)]);
    expect(first).not.toBe(second);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    fetchSpy.mockRestore();
  });

  it('retries a URL that failed', async () => {
    const registry = TestBed.inject(BsIconRegistry);
    const fetchSpy = vi
      .spyOn(window, 'fetch')
      .mockResolvedValueOnce(new Response('', { status: 404 }))
      .mockResolvedValueOnce(new Response('<svg xmlns="http://www.w3.org/2000/svg"/>'));
    await expect(registry.load('/icon.svg')).rejects.toThrow('failed to load (404)');
    await expect(registry.load('/icon.svg')).resolves.toBeInstanceOf(SVGSVGElement);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    fetchSpy.mockRestore();
  });

  it('has the built-in libraries', () => {
    const registry = TestBed.inject(BsIconRegistry);
    expect(registry.defaultLibrary()).toBe('bootstrap');
    expect(registry.get('bootstrap')!.resolver('heart', null)).toBe(
      'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/icons/heart.svg',
    );
    expect(registry.get('font-awesome')!.resolver('github', 'brands')).toMatch(
      /fontawesome-free@[\d.]+\/svgs\/brands\/github\.svg$/,
    );
    expect(registry.get('material')!.resolver('home', 'rounded')).toMatch(
      /svg-400@[\d.]+\/rounded\/home\.svg$/,
    );
    expect(registry.get('modus')!.resolver('heart', null)).toMatch(
      /modus-icons@[\d.]+\/dist\/modus-solid\/svg\/heart\.svg$/,
    );
    expect(registry.get('phosphor')!.resolver('heart', null)).toMatch(
      /@phosphor-icons\/core@[\d.]+\/assets\/regular\/heart\.svg$/,
    );
  });

  it('builds URLs from a custom baseUrl', () => {
    const baseUrl = '/assets/icons';
    expect(bootstrapIcons({ baseUrl }).resolver('heart', null)).toBe('/assets/icons/heart.svg');
    expect(modusIcons({ baseUrl }).resolver('heart', 'outlined')).toBe(
      '/assets/icons/modus-outlined/svg/heart.svg',
    );
    expect(fontAwesomeIcons({ baseUrl }).resolver('bell', null)).toBe(
      '/assets/icons/solid/bell.svg',
    );
    expect(materialSymbols({ baseUrl }).resolver('home-fill', null)).toBe(
      '/assets/icons/outlined/home-fill.svg',
    );
    expect(phosphorIcons({ baseUrl }).resolver('heart', 'regular')).toBe(
      '/assets/icons/regular/heart.svg',
    );
    expect(phosphorIcons({ baseUrl }).resolver('heart', 'duotone')).toBe(
      '/assets/icons/duotone/heart-duotone.svg',
    );
  });
});
