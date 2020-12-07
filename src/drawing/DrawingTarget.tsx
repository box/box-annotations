import * as React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import DecoratedDrawingPath from './DecoratedDrawingPath';
import DrawingPathGroup from './DrawingPathGroup';
import { DrawingSVGRef } from './DrawingSVG';
import { getCenter, getShape } from './drawingUtil';
import { MOUSE_PRIMARY } from '../constants';
import { TargetDrawing } from '../@types';
import './DrawingTarget.scss';

export type Props = {
    annotationId: string;
    className?: string;
    isActive?: boolean;
    onSelect?: (annotationId: string) => void;
    rootEl: DrawingSVGRef | null;
    target: TargetDrawing;
};

export type DrawingTargetRef = HTMLAnchorElement;

export const DrawingTarget = (props: Props, ref: React.Ref<DrawingTargetRef>): JSX.Element => {
    const {
        annotationId,
        className,
        isActive = false,
        onSelect = noop,
        rootEl,
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
        const activeElement = document.activeElement as HTMLElement;

        event.preventDefault(); // Prevents focus from leaving the button immediately in some browsers
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
            {pathGroups.map(({ clientId: pathGroupClientId, paths, stroke }) => (
                <DrawingPathGroup key={pathGroupClientId} isActive={isActive} rootEl={rootEl} stroke={stroke}>
                    {/* Use the children render function to pass down the calculated strokeWidthWithBorder value */}
                    {strokeWidthWithBorder =>
                        paths.map(({ clientId: pathClientId, points }) => (
                            <DecoratedDrawingPath
                                key={pathClientId}
                                borderStrokeWidth={strokeWidthWithBorder}
                                isDecorated
                                points={points}
                            />
                        ))
                    }
                </DrawingPathGroup>
            ))}
        </a>
    );
};

export default React.forwardRef(DrawingTarget);
