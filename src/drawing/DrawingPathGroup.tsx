import * as React from 'react';
import classNames from 'classnames';
import { DrawingSVGRef } from './DrawingSVG';
import { isVectorEffectSupported } from './drawingUtil';
import { Stroke } from '../@types';

export type ChildrenRenderFunction = (strokeWidthWithBorder: number) => React.ReactNode;

export type Props = {
    children?: React.ReactNode | ChildrenRenderFunction;
    isActive?: boolean;
    rootEl: DrawingSVGRef | null;
    stroke: Stroke;
};

export const DRAWING_BORDER_WIDTH = 1;

export const DrawingPathGroup = ({
    children,
    isActive = false,
    rootEl,
    stroke: { color, size },
}: Props): JSX.Element => {
    let strokeWidth = size;
    // A line has two sides and each side needs a border, so add DRAWING_BORDER_WIDTH * 2
    let strokeWidthWithBorder = strokeWidth + DRAWING_BORDER_WIDTH * 2;

    // "vector-effect: non-scaling-stroke" prevents stroke width to be scaled
    // However, IE/Edge doesn't support it, so we have to manually inverse scale the stroke width
    if (!isVectorEffectSupported()) {
        if (!rootEl) {
            return <g className="ba-DrawingPathGroup" />;
        }
        const { clientWidth } = rootEl;
        const scale = clientWidth / 100; // SVG viewbox is 100 * 100
        strokeWidth /= scale;
        strokeWidthWithBorder /= scale;
    }

    return (
        <g
            className={classNames('ba-DrawingPathGroup', { 'is-active': isActive })}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
        >
            {typeof children === 'function' ? children(strokeWidthWithBorder) : children}
        </g>
    );
};

export default DrawingPathGroup;
