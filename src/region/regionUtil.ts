import * as React from 'react';
import { Rect } from '../@types';

export type Shape = {
    height: number;
    width: number;
    x: number;
    y: number;
};

export const BORDER_SIZE = 4;
export const BORDER_TOTAL = BORDER_SIZE * 2;

export function scaleShape(shape: Rect, scale = 1, invert = false): Rect {
    const { height, width, x, y, ...rest } = shape;
    const ratio = invert ? 1 / scale : scale;

    return {
        ...rest,
        height: height * ratio,
        width: width * ratio,
        x: x * ratio,
        y: y * ratio,
    };
}

export function styleShape(shape?: Shape): React.CSSProperties {
    if (!shape) {
        return {};
    }

    const { height, width, x, y } = shape;
    return {
        height: `${height + BORDER_TOTAL}px`,
        transform: `translate(${x - BORDER_SIZE}px, ${y - BORDER_SIZE}px)`,
        width: `${width + BORDER_TOTAL}px`,
    };
}
