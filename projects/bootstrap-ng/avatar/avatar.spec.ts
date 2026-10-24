import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsAvatar } from './avatar';

@Component({
  imports: [BsAvatar],
  template: `
    <span bsAvatar [src]="src()" alt="Ada" size="lg" status="busy">AL</span>
    <span bsAvatar class="initials" theme="primary" subtle>CD</span>
  `,
})
class Host {
  readonly src = signal<string | null>(null);
}

describe('BsAvatar', () => {
  it('shows initials, classes and a labelled status', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [first, second] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[bsAvatar]'),
    );
    expect(first.className).toBe('avatar avatar-lg');
    expect(first.textContent).toContain('AL');
    const status = first.querySelector('.avatar-status')!;
    expect(status.className).toBe('avatar-status status-busy');
    expect(status.getAttribute('role')).toBe('img');
    expect(status.getAttribute('aria-label')).toBe('Busy');
    expect(second.classList).toContain('avatar-subtle');
    expect(second.classList).toContain('theme-primary');
    expect(second.classList).toContain('initials');
  });

  it('shows the image and falls back to initials when it fails', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.src.set('/does-not-exist.png');
    await fixture.whenStable();
    const avatar: HTMLElement = fixture.nativeElement.querySelector('[bsAvatar]');
    const img = avatar.querySelector('img')!;
    expect(img.className).toBe('avatar-img');
    expect(img.alt).toBe('Ada');
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(avatar.querySelector('img')).toBeNull();
    });
    expect(avatar.textContent).toContain('AL');
  });
});
