import * as React from 'react';
import { Annotation, AnnotationRegion, Position } from '../@types';
import { invertYCoordinate, Point, rotatePoint, translatePoint } from './transformUtils';

const ROTATION_ONCE_DEG = -90;
const ROTATION_TWICE_DEG = -180;
const ROTATION_THRICE_DEG = -270;

export type CoordinateSpace = {
    height: number;
    width: number;
};

export type Shape = {
    height: number;
    width: number;
    x: number;
    y: number;
};

export type Translation = {
    dx?: number;
    dy?: number;
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

export const getPoints = (shape: Shape): [Point, Point, Point, Point] => {
    const { height, width, x, y } = shape;

    // Define the points from x,y and then in a clockwise fashion
    // p1      p2
    // +-------+
    // |       |
    // +-------+
    // p4      p3
    const p1 = { x, y };
    const p2 = { x: x + width, y };
    const p3 = { x: x + width, y: y + height };
    const p4 = { x, y: y + height };

    return [p1, p2, p3, p4];
};

export function selectTransformationPoint(shape: Shape, rotation: number): Point | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [p1, p2, p3, p4] = getPoints(shape);

    // Determine which point will be the new x,y (as defined as the top left point) after rotation
    // If -90deg: use p2
    // If -180deg: use p3
    // If -270deg: use p4
    switch (rotation) {
        case ROTATION_ONCE_DEG:
            return p2;
        case ROTATION_TWICE_DEG:
            return p3;
        case ROTATION_THRICE_DEG:
            return p4;
        default:
            return null;
    }
}

// Determines the translation needed to anchor the bottom left corner of the
// coordinate space at the (0, 0) origin after rotation.
export function selectTranslation(coordinateSpace: CoordinateSpace, rotation: number): Translation {
    const { height, width } = coordinateSpace;

    switch (rotation) {
        case ROTATION_ONCE_DEG:
            return { dx: height };
        case ROTATION_TWICE_DEG:
            return { dx: width, dy: height };
        case ROTATION_THRICE_DEG:
            return { dy: width };
        default:
    }

    return { dx: 0, dy: 0 };
}

export function getTransformedShape(
    shape: Shape,
    rotation: number,
    coordinateSpace: CoordinateSpace = { height: 100, width: 100 },
): Shape {
    const { height: shapeHeight, width: shapeWidth } = shape;
    const { height: spaceHeight, width: spaceWidth } = coordinateSpace;
    const isInverted = rotation % 180 === 0;
    const isNoRotation = rotation % 360 === 0;
    const translation = selectTranslation(coordinateSpace, rotation);
    const point = selectTransformationPoint(shape, rotation);

    if (isNoRotation || !point) {
        return shape;
    }

    // To transform from shape with 0 rotation to provided rotation:
    // 1. Invert y-axis to convert from web to mathematical coordinate system
    // 2. Apply rotation transformation (with inverted rotation -- again mathematical coordinate system)
    // 3. Translate to align coordinate space with mathematical origin
    // 4. Invert y-axis to convert back to web coordinate system
    const invertedPoint = invertYCoordinate(point, spaceHeight);
    const rotatedPoint = rotatePoint(invertedPoint, -rotation);
    const translatedPoint = translatePoint(rotatedPoint, translation);
    const { x: transformedX, y: transformedY } = invertYCoordinate(
        translatedPoint,
        isInverted ? spaceHeight : spaceWidth,
    );

    return {
        height: isInverted ? shapeHeight : shapeWidth,
        width: isInverted ? shapeWidth : shapeHeight,
        x: transformedX,
        y: transformedY,
    };
}

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
