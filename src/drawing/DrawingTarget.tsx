import * as React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { MOUSE_PRIMARY } from '../constants';
import { TargetDrawing } from '../@types';
import { getCenter, getShape } from './drawingUtil';
import './DrawingTarget.scss';

export type Props = {
    annotationId: string;
    className?: string;
    isActive?: boolean;
    onSelect?: (annotationId: string) => void;
    target: TargetDrawing;
};

export type DrawingTargetRef = HTMLAnchorElement;

export const DrawingTarget = (props: Props, ref: React.Ref<DrawingTargetRef>): JSX.Element => {
    const {
        annotationId,
        className,
        isActive = false,
        onSelect = noop,
        target: { path_groups: pathGroups },
    } = props;
    const shape = getShape(pathGroups);
    const { x: centerX, y: centerY } = getCenter(shape);

    const handleFocus = (): void => {
        onSelect(annotationId);
    };
    const handleMouseDown = (event: React.MouseEvent<DrawingTargetRef>): void => {
        if (event.buttons !== MOUSE_PRIMARY) {
            return;
        }

        event.preventDefault(); // Prevents focus from leaving the button immediately in some browsers
        event.nativeEvent.stopImmediatePropagation(); // Prevents document event handlers from executing
        if (event.currentTarget.focus) {
            // Buttons do not receive focus in Firefox and Safari on MacOS; triggers handleFocus
            event.currentTarget.focus();
        } else {
            // IE11 won't apply the focus to the SVG anchor and does not have focus function; call handleFocus directly
            handleFocus();
        }
    };

    return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
            ref={ref}
            className={classNames('ba-DrawingTarget', className, { 'is-active': isActive })}
            data-resin-itemid={annotationId}
            data-resin-target="highlightDrawing"
            data-testid={`ba-AnnotationTarget-${annotationId}`}
            href="#"
            onFocus={handleFocus}
            onMouseDown={handleMouseDown}
            role="button"
            tabIndex={0}
        >
            <rect
                fill="transparent"
                transform={`translate(-${centerX * 0.1}, -${centerY * 0.1}) scale(1.1)`}
                {...shape}
            />
        </a>
    );
};

export default React.forwardRef(DrawingTarget);
