import * as React from 'react';
import { white } from 'box-ui-elements/es/styles/variables';
import DrawingPath from './DrawingPath';
import { Position } from '../@types';
import './DecoratedDrawingPath.scss';

export type Props = {
    borderStrokeWidth?: number;
    isDecorated?: boolean;
    points?: Position[];
};

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

const DecoratedDrawingPath = (props: Props): JSX.Element => {
    const { borderStrokeWidth = 0, isDecorated = false, points = [] } = props;
    const pathCommands = getPathCommands(points);
    return (
        <g className="ba-DrawingPath">
            {isDecorated && (
                <g className="ba-DrawingPath-decoration">
                    <DrawingPath
                        className="ba-DrawingPath-shadow"
                        filter="url(#ba-DrawingSVG-shadow)"
                        pathCommands={pathCommands}
                    />
                    <DrawingPath
                        className="ba-DrawingPath-border"
                        fill="none"
                        pathCommands={pathCommands}
                        stroke={white}
                        strokeWidth={borderStrokeWidth}
                    />
                </g>
            )}
            <DrawingPath pathCommands={pathCommands} />
        </g>
    );
};

export default DecoratedDrawingPath;
