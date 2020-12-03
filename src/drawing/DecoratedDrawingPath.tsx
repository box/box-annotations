import * as React from 'react';
import { white } from 'box-ui-elements/es/styles/variables';
import DrawingPath from './DrawingPath';
import { getPathCommands } from './drawingUtil';
import { Position } from '../@types';
import './DecoratedDrawingPath.scss';

export type Props = {
    borderStrokeWidth?: number;
    isDecorated?: boolean;
    points?: Position[];
};

export default function DecoratedDrawingPath({
    borderStrokeWidth = 0,
    isDecorated = false,
    points = [],
}: Props): JSX.Element {
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
}
