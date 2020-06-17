import { Position } from '../@types';

export type ScrollOptions = {
    offsets?: Position;
    threshold?: number;
};

const DEFAULT_OFFSETS = { x: 0, y: 0 };
const DEFAULT_THRESHOLD = 1000; // pixels

export function scrollToLocation(parentEl: HTMLElement, referenceEl: HTMLElement, options: ScrollOptions = {}): void {
    const { offsets = DEFAULT_OFFSETS, threshold = DEFAULT_THRESHOLD } = options;
    const { x: offsetX, y: offsetY } = offsets;

    const canSmoothScroll = 'scrollBehavior' in parentEl.style;
    const parentCenterX = Math.round(parentEl.clientWidth / 2);
    const parentCenterY = Math.round(parentEl.clientHeight / 2);
    const offsetCenterX = Math.round(referenceEl.clientWidth * (offsetX / 100));
    const offsetCenterY = Math.round(referenceEl.clientHeight * (offsetY / 100));
    const offsetScrollLeft = referenceEl.offsetLeft - parentCenterX + offsetCenterX;
    const offsetScrollTop = referenceEl.offsetTop - parentCenterY + offsetCenterY;
    const scrollLeft = Math.max(0, Math.min(offsetScrollLeft, parentEl.scrollWidth));
    const scrollTop = Math.max(0, Math.min(offsetScrollTop, parentEl.scrollHeight));

    if (canSmoothScroll && Math.abs(parentEl.scrollTop - scrollTop) < threshold) {
        parentEl.scrollTo({
            behavior: 'smooth',
            left: scrollLeft,
            top: scrollTop,
        });
    } else {
        parentEl.scrollLeft = scrollLeft;
        parentEl.scrollTop = scrollTop;
    }
}
