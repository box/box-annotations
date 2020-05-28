import * as React from 'react';
import { Annotation, AnnotationRegion, Position } from '../@types';

export type Shape = {
    height: number;
    width: number;
    x: number;
    y: number;
};

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

export function styleShape(shape?: Shape): React.CSSProperties {
    if (!shape) {
        return EMPTY_STYLE;
    }

    const { height, width, x, y } = shape;

    return {
        display: 'block', // Override inline "display: none" from EMPTY_STYLE
        height: `${height}%`,
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
    };
}
