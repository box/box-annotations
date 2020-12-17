import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import useMountId from '../common/useMountId';
import { MOUSE_PRIMARY } from '../constants';
import { Rect } from '../@types/model';
import './HighlightTarget.scss';

type Props = {
    annotationId: string;
    className?: string;
    isActive?: boolean;
    onHover?: (annotationId: string | null) => void;
    onMount?: (uuid: string) => void;
    onSelect?: (annotationId: string) => void;
    shapes: Array<Rect>;
};

export type HighlightTargetRef = HTMLAnchorElement;

const HighlightTarget = (props: Props, ref: React.Ref<HighlightTargetRef>): JSX.Element => {
    const { annotationId, className, isActive, onHover = noop, onMount = noop, onSelect = noop, shapes } = props;
    const uuid = useMountId(onMount);

    const handleClick = (event: React.MouseEvent<HighlightTargetRef>): void => {
        // These are needed to prevent the anchor link from being followed and updating the url location
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };

    const handleFocus = (): void => {
        onSelect(annotationId);
    };

    const handleMouseEnter = (): void => {
        onHover(annotationId);
    };

    const handleMouseLeave = (): void => {
        onHover(null);
    };

    const handleMouseDown = (event: React.MouseEvent<HighlightTargetRef>): void => {
        if (event.buttons !== MOUSE_PRIMARY) {
            return;
        }
        const activeElement = document.activeElement as HTMLElement;

        event.preventDefault(); // Prevents focus from leaving the anchor immediately in some browsers
        event.nativeEvent.stopImmediatePropagation(); // Prevents document event handlers from executing

        // IE11 won't apply the focus to the SVG anchor, so this workaround attempts to blur the existing active element.
        // If we don't blur it, we cannot re-focus it next time, since it was already focused and never got blurred.
        if (activeElement && activeElement !== event.currentTarget && activeElement.blur) {
            activeElement.blur();
        }

        if (event.currentTarget.focus) {
            // Buttons do not receive focus in Firefox and Safari on MacOS; triggers handleFocus
            event.currentTarget.focus();
        } else {
            // IE11 does not support focus function; call handleFocus directly
            handleFocus();
        }
    };

    return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
            ref={ref}
            className={classNames('ba-HighlightTarget', className, { 'is-active': isActive })}
            data-ba-reference-id={uuid}
            data-resin-itemid={annotationId}
            data-resin-target="highlightText"
            data-testid={`ba-AnnotationTarget-${annotationId}`}
            href="#"
            onClick={handleClick}
            onFocus={handleFocus}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
        >
            {shapes.map(rect => {
                const { height, width, x, y } = rect;
                return (
                    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
                    <rect
                        key={`${annotationId}-${x}-${y}-${width}-${height}`}
                        className="ba-HighlightTarget-rect"
                        fill="none"
                        height={`${height}%`}
                        width={`${width}%`}
                        x={`${x}%`}
                        y={`${y}%`}
                    />
                );
            })}
        </a>
    );
};

export { HighlightTarget as HighlightTargetComponent };

export default React.forwardRef(HighlightTarget);
