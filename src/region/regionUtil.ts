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
export const EMPTY_STYLE = { display: 'none' };

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
        return EMPTY_STYLE;
    }

    const { height, width, x, y } = shape;
    return {
        display: 'block', // Override inline "display: none" from EMPTY_STYLE
        height: `${height + BORDER_TOTAL}px`,
        transform: `translate3d(${x - BORDER_SIZE}px, ${y - BORDER_SIZE}px, 0)`, // GPU acceleration with translate3d
        width: `${width + BORDER_TOTAL}px`,
    };
}
