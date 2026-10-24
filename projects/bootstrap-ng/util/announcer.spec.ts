import { TestBed } from '@angular/core/testing';
import { BsLiveAnnouncer } from './announcer';

describe('BsLiveAnnouncer', () => {
  const region = (politeness: string) =>
    document.querySelector<HTMLElement>(`body > [aria-live="${politeness}"]`);

  it('writes messages into persistent, visually hidden live regions', async () => {
    const announcer = TestBed.inject(BsLiveAnnouncer);
    announcer.announce(' Saved ');
    const polite = region('polite')!;
    expect(polite.classList).toContain('visually-hidden');
    expect(polite.getAttribute('aria-atomic')).toBe('true');
    // Written after a delay, so a region that was just added is registered first.
    expect(polite.textContent).toBe('');
    await vi.waitFor(() => expect(polite.textContent).toBe('Saved'));

    announcer.announce('Failed', 'assertive');
    // The other region is cleared so only the newest message is read.
    expect(polite.textContent).toBe('');
    await vi.waitFor(() => expect(region('assertive')!.textContent).toBe('Failed'));

    announcer.announce('Again', 'assertive');
    announcer.clear();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(region('assertive')!.textContent).toBe('');
  });

  it('recreates a region that was removed from the page', async () => {
    const announcer = TestBed.inject(BsLiveAnnouncer);
    announcer.announce('One');
    region('polite')!.remove();
    announcer.announce('Two');
    await vi.waitFor(() => expect(region('polite')!.textContent).toBe('Two'));
  });

  it('removes its regions and pending messages when the app is destroyed', async () => {
    const announcer = TestBed.inject(BsLiveAnnouncer);
    announcer.announce('Late');
    TestBed.resetTestingModule();
    expect(region('polite')).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(region('polite')).toBeNull();
  });
});
