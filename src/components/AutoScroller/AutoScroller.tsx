import * as React from 'react';
import noop from 'lodash/noop';
import { getScrollParent } from './util';

export type Props = Partial<React.Attributes> & {
    as?: React.ElementType;
    children?: React.ReactNode;
    className?: string;
    enabled?: boolean;
    onScroll?: (x: number, y: number) => void;
};

const SCROLL_DELTA = 0.2; // Intensity to ramp up scroll speed as the cursor moves deeper into the scroll gutter
const SCROLL_GUTTER = 50; // Invisible zone within the component that triggers auto-scroll

export function AutoScroller(props: Props, ref: React.Ref<Element>): JSX.Element {
    const { as: Element = 'div', children, enabled, onScroll = noop, ...rest } = props;

    // Create refs to store un-rendered data, references, and state
    const handleRef = React.useRef<number | null>(null);
    const parentRef = React.useRef<Element | null>(null);
    const parentRectRef = React.useRef<DOMRect | null>(null);
    const positionXRef = React.useRef<number | null>(null);
    const positionYRef = React.useRef<number | null>(null);
    const referenceRef = React.useRef<Element | null>(null);

    // Create handlers to be called when autoscroll is enabled
    const checkStep = (callback: () => void): void => {
        handleRef.current = window.requestAnimationFrame(callback);
    };
    const checkScroll = (): void => {
        const { current: positionX } = positionXRef;
        const { current: positionY } = positionYRef;
        const { current: parentRect } = parentRectRef;
        const { current: parent } = parentRef;

        if (!parent || !parentRect || positionX === null || positionY === null) {
            return checkStep(checkScroll);
        }

        // Calculate the inner scroll gutters for the scroll parent
        const edgeLeft = parentRect.left + SCROLL_GUTTER;
        const edgeRight = parentRect.right - SCROLL_GUTTER;
        const edgeBottom = parentRect.bottom - SCROLL_GUTTER;
        const edgeTop = parentRect.top + SCROLL_GUTTER;

        // Check if the current position is within any of the gutters
        const isEdgeLeft = positionX < edgeLeft;
        const isEdgeRight = positionX > edgeRight;
        const isEdgeBottom = positionY > edgeBottom;
        const isEdgeTop = positionY < edgeTop;

        if (!isEdgeBottom && !isEdgeLeft && !isEdgeRight && !isEdgeTop) {
            return checkStep(checkScroll);
        }

        let nextScrollLeft = parent.scrollLeft;
        let nextScrollTop = parent.scrollTop;

        if (isEdgeLeft) {
            nextScrollLeft -= (edgeLeft - positionX) * SCROLL_DELTA;
        } else if (isEdgeRight) {
            nextScrollLeft += (positionX - edgeRight) * SCROLL_DELTA;
        }

        if (isEdgeTop) {
            nextScrollTop -= (edgeTop - positionY) * SCROLL_DELTA;
        } else if (isEdgeBottom) {
            nextScrollTop += (positionY - edgeBottom) * SCROLL_DELTA;
        }

        // Sanitize inputs and use legacy scroll APIs for better browser support and smoother scrolling
        parent.scrollLeft = Math.max(0, Math.min(Math.round(nextScrollLeft), parent.scrollWidth));
        parent.scrollTop = Math.max(0, Math.min(Math.round(nextScrollTop), parent.scrollHeight));

        // Inform the parent of the scroll change, if any
        onScroll(positionX, positionY);

        return checkStep(checkScroll);
    };

    // Create reference to scroll parent on mount
    React.useEffect(() => {
        const { current: reference } = referenceRef;

        if (reference) {
            parentRef.current = getScrollParent(reference);
            parentRectRef.current = parentRef.current.getBoundingClientRect();
        }
    }, [referenceRef]);

    // Create document-level event handlers for mouse/touch move
    React.useEffect(() => {
        const handleMouseMove = ({ clientX, clientY }: MouseEvent): void => {
            positionXRef.current = clientX;
            positionYRef.current = clientY;
        };
        const handleTouchMove = ({ targetTouches }: TouchEvent): void => {
            positionXRef.current = targetTouches[0].clientX;
            positionYRef.current = targetTouches[0].clientY;
        };
        const cleanup = (): void => {
            const { current: handle } = handleRef;

            // Cancel the scroll check loop
            if (handle) {
                window.cancelAnimationFrame(handle);
            }

            // Destroy stale references
            handleRef.current = null;
            positionXRef.current = null;
            positionYRef.current = null;

            // Destroy event listeners to avoid leaks
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
        };

        if (enabled) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('touchmove', handleTouchMove);

            checkStep(checkScroll);
        }

        return cleanup;
    }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

    // Synchronize the outer ref with the inner ref
    React.useImperativeHandle(ref, () => referenceRef.current as Element, [referenceRef]);

    return (
        <Element ref={referenceRef} {...rest}>
            {children}
        </Element>
    );
}

export default React.memo(React.forwardRef(AutoScroller));
