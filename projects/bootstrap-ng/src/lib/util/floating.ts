import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  type Placement,
  shift,
} from '@floating-ui/dom';

type BsSide = 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';

/**
 * Where a floating element (tooltip, popover, menu) sits next to its trigger.
 * `start` and `end` follow the text direction, like Bootstrap's logical placements.
 */
export type BsPlacement = BsSide | `${BsSide}-start` | `${BsSide}-end`;

/** Resolves `start` / `end` sides to `left` / `right` for the element's text direction. */
export function resolvePlacement(placement: BsPlacement, element: Element): Placement {
  const rtl = getComputedStyle(element).direction === 'rtl';
  return placement
    .replace(/^start(?=-|$)/, rtl ? 'right' : 'left')
    .replace(/^end(?=-|$)/, rtl ? 'left' : 'right') as Placement;
}

export interface FloatingOptions {
  placement: BsPlacement;
  /** Distance from the trigger, in pixels. */
  offset: number;
  fallbackPlacements?: BsPlacement[];
  /** Arrow element, positioned along the edge the floating element faces. */
  arrow?: HTMLElement | null;
}

/**
 * Keeps `floating` positioned next to `reference` with Floating UI while either moves.
 * Sets `data-bs-placement` to the final placement, which Bootstrap's CSS reads for
 * the arrow and transform origin. Returns a function that stops the updates.
 */
export function autoPosition(
  reference: HTMLElement,
  floating: HTMLElement,
  options: () => FloatingOptions,
): () => void {
  const update = async () => {
    const { placement, fallbackPlacements, arrow: arrowElement, ...rest } = options();
    const middleware = [
      offset(rest.offset),
      flip({
        fallbackPlacements: fallbackPlacements?.map((p) => resolvePlacement(p, reference)),
      }),
      shift({ padding: 4 }),
    ];
    if (arrowElement) {
      middleware.push(arrow({ element: arrowElement }));
    }

    const result = await computePosition(reference, floating, {
      placement: resolvePlacement(placement, reference),
      middleware,
    });

    if (!floating.isConnected) {
      return;
    }

    Object.assign(floating.style, {
      position: 'absolute',
      left: `${result.x}px`,
      top: `${result.y}px`,
      margin: '0',
    });
    floating.setAttribute('data-bs-placement', result.placement);

    if (arrowElement && result.middlewareData.arrow) {
      const { x, y } = result.middlewareData.arrow;
      const vertical = result.placement.startsWith('top') || result.placement.startsWith('bottom');
      Object.assign(arrowElement.style, {
        position: 'absolute',
        left: vertical && x !== undefined ? `${x}px` : '',
        top: !vertical && y !== undefined ? `${y}px` : '',
      });
    }
  };

  return autoUpdate(reference, floating, () => {
    void update();
  });
}
