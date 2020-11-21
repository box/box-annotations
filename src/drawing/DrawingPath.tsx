import * as React from 'react';
import { Position } from '../@types';
import './DrawingPath.scss';

export type Props = {
    borderStrokeWidth?: number;
    isDecorated?: boolean;
    points?: Position[];
};

export type DrawingPathRef = SVGPathElement;

// We use cubic Bezier curves to generate path commands for better smoothing.
// For every data point, we generate extra two points using adjacent data points.
// Then we use the first generated point and the data point as two control points
// and the second generated point as the destination point to form a (C)urve command.
export const getPathCommands = (points?: Position[]): string => {
    if (!points || !points.length) {
        return '';
    }

    const { x: startX, y: startY } = points[0];
    const d = points
        .map(({ x, y }, index, array) => {
            const prevPoint = array[index - 1];
            const nextPoint = array[index + 1];
            if (!prevPoint || !nextPoint) {
                return '';
            }

            const xc1 = (x + prevPoint.x) / 2;
            const yc1 = (y + prevPoint.y) / 2;
            const xc2 = (x + nextPoint.x) / 2;
            const yc2 = (y + nextPoint.y) / 2;

            return `C ${xc1} ${yc1}, ${x} ${y}, ${xc2} ${yc2}`;
        })
        .join(' ');

    return `M ${startX} ${startY} ${d}`;
};

export const DrawingPath = (props: Props, ref: React.Ref<DrawingPathRef>): JSX.Element => {
    const { borderStrokeWidth = 0, isDecorated = false, points = [] } = props;
    const pathCommands = getPathCommands(points);
    return (
        <g className="ba-DrawingPath">
            {isDecorated && (
                <g className="ba-DrawingPath-decoration">
                    <path
                        className="ba-DrawingPath-shadow"
                        d={pathCommands}
                        filter="url(#ba-DrawingSVG-shadow)"
                        vectorEffect="non-scaling-stroke"
                    />
                    <path
                        className="ba-DrawingPath-border"
                        d={pathCommands}
                        fill="none"
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeWidth={borderStrokeWidth}
                        vectorEffect="non-scaling-stroke"
                    />
                </g>
            )}
            <path ref={ref} d={pathCommands} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </g>
    );
};

export default React.forwardRef(DrawingPath);
