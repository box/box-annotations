import * as React from 'react';
import { Annotation, AnnotationRegion, Position, Rect } from '../@types';

export type Shape = {
    height: number;
    width: number;
    x: number;
    y: number;
};

export const BORDER_SIZE = 4;
export const BORDER_TOTAL = BORDER_SIZE * 2;
export const EMPTY_STYLE = { display: 'none' };

export const centerShape = (shape: Shape): Position => {
    const { height, width } = shape;

    return {
        x: width / 2,
        y: height / 2,
    };
};

export const centerRegion = (shape: Shape): Position => {
    const { x: shapeX, y: shapeY } = shape;
    const { x: centerX, y: centerY } = centerShape(shape);

    return {
        x: centerX + shapeX,
        y: centerY + shapeY,
    };
};

export function isRegion(annotation: Annotation): annotation is AnnotationRegion {
    return annotation?.target?.type === 'region';
}

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

export function styleShape(shape?: Shape, useGpu = false): React.CSSProperties {
    if (!shape) {
        return EMPTY_STYLE;
    }

    const { height, width, x, y } = shape;
    const totalX = x - BORDER_SIZE;
    const totalY = y - BORDER_SIZE;

    return {
        display: 'block', // Override inline "display: none" from EMPTY_STYLE
        height: `${height + BORDER_TOTAL}px`,
        transform: useGpu ? `translate3d(${totalX}px, ${totalY}px, 0)` : `translate(${totalX}px, ${totalY}px)`,
        width: `${width + BORDER_TOTAL}px`,
    };
}
