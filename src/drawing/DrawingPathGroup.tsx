import * as React from 'react';
import classNames from 'classnames';
import DrawingPath from './DrawingPath';
import { DrawingSVGRef } from './DrawingSVG';
import { isVectorEffectSupported } from './drawingUtil';
import { PathGroup } from '../@types';

export type Props = {
    isActive?: boolean;
    pathGroup: PathGroup;
    rootEl: DrawingSVGRef | null;
};

export const DRAWING_BORDER_WIDTH = 1;

export const getStrokeWidths = (
    initialWidth: number,
    referenceEl: DrawingSVGRef | null,
): { strokeWidth: number; strokeWidthWithBorder: number } | null => {
    let strokeWidth = initialWidth;
    // A line has two sides and each side needs a border, so add DRAWING_BORDER_WIDTH * 2
    let strokeWidthWithBorder = strokeWidth + DRAWING_BORDER_WIDTH * 2;

    // "vector-effect: non-scaling-stroke" prevents stroke width to be scaled
    // However, IE/Edge doesn't support it, so we have to manually inverse scale the stroke width
    if (!isVectorEffectSupported()) {
        if (!referenceEl) {
            return null;
        }
        const { clientWidth } = referenceEl;
        const scale = clientWidth / 100; // SVG viewbox is 100 * 100
        strokeWidth /= scale;
        strokeWidthWithBorder /= scale;
    }

    return {
        strokeWidth,
        strokeWidthWithBorder,
    };
};

export const DrawingPathGroup = ({
    isActive = false,
    pathGroup: {
        paths,
        stroke: { color, size },
    },
    rootEl,
}: Props): JSX.Element => {
    const { strokeWidth, strokeWidthWithBorder } = getStrokeWidths(size, rootEl) ?? {};

    return !strokeWidth || !strokeWidthWithBorder ? (
        <g className="ba-DrawingPathGroup" />
    ) : (
        <g
            className={classNames('ba-DrawingPathGroup', { 'is-active': isActive })}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
        >
            {paths.map(({ clientId, points }) => (
                <DrawingPath key={clientId} borderStrokeWidth={strokeWidthWithBorder} isDecorated points={points} />
            ))}
        </g>
    );
};

export default DrawingPathGroup;
