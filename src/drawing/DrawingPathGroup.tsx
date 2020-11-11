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

export const DrawingPathGroup = ({
    isActive = false,
    pathGroup: {
        paths,
        stroke: { color, size },
    },
    rootEl,
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
            {paths.map(({ clientId, points }) => (
                <DrawingPath key={clientId} borderStrokeWidth={strokeWidthWithBorder} decorated points={points} />
            ))}
        </g>
    );
};

export default DrawingPathGroup;
