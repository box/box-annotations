import { Position } from '../@types';

export type ScrollOptions = {
    offsets?: Position;
    threshold?: number;
};

const DEFAULT_OFFSETS = { x: 0, y: 0 };
const DEFAULT_THRESHOLD = 1000; // pixels

export function scrollToLocation(parentEl: HTMLElement, referenceEl: HTMLElement, options: ScrollOptions = {}): void {
    const { offsets = DEFAULT_OFFSETS, threshold = DEFAULT_THRESHOLD } = options;
    const { x: offsetXPercentage, y: offsetYPercentage } = offsets;
    // Get the bounding client rects so that the offsetLeft of the reference element can be calculated --
    // even if it has been transformed via rotation
    const { left: parentLeft, top: parentTop } = parentEl.getBoundingClientRect();
    const {
        height: referenceHeight,
        left: referenceLeft,
        top: referenceTop,
        width: referenceWidth,
    } = referenceEl.getBoundingClientRect();

    const canSmoothScroll = 'scrollBehavior' in parentEl.style;
    // Get the midpoint of the scrollable area (parent element)
    const parentCenterX = Math.round(parentEl.clientWidth / 2);
    const parentCenterY = Math.round(parentEl.clientHeight / 2);
    // Get any specified offset relative to the reference element
    const offsetX = Math.round(referenceWidth * (offsetXPercentage / 100)); // offsetX is assumed to be a percentage
    const offsetY = Math.round(referenceHeight * (offsetYPercentage / 100)); // offsetY is assumed to be a percentage
    // Get the offsets of the reference element relative to the viewport
    const referenceOffsetLeft = referenceLeft - parentLeft;
    const referenceOffsetTop = referenceTop - parentTop;
    // Get the scroll offsets to center the parent element on the top left corner of the reference element and then apply any provided offset
    const offsetScrollLeft = referenceOffsetLeft - parentCenterX + offsetX;
    const offsetScrollTop = referenceOffsetTop - parentCenterY + offsetY;
    const scrollLeftDelta = Math.min(offsetScrollLeft, parentEl.scrollWidth);
    const scrollTopDelta = Math.min(offsetScrollTop, parentEl.scrollHeight);
    // Get the absolute scroll offsets by applying the delta to the current value
    const scrollLeft = Math.max(0, parentEl.scrollLeft + scrollLeftDelta);
    const scrollTop = Math.max(0, parentEl.scrollTop + scrollTopDelta);

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
