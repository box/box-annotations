import { Dimensions, Position, Shape } from '../@types';

export type Translation = {
    dx?: number;
    dy?: number;
};

// Possible rotation values as supplied by box-content-preview
const ROTATION_ONCE_DEG = -90;
const ROTATION_TWICE_DEG = -180;
const ROTATION_THRICE_DEG = -270;

// Annotation shapes are, by default, percentages, so a 100x100 space
const DEFAULT_DIMENSIONS = { height: 100, width: 100 };

export const invertYCoordinate = ({ x, y }: Position, height: number): Position => ({
    x,
    y: height > 0 ? height - y : y,
});

export const rotatePoint = ({ x, y }: Position, rotationInDegrees: number): Position => {
    const radians = (rotationInDegrees * Math.PI) / 180;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    // Formula to apply a rotation to a position is:
    // x' = x * cos(θ) - y * sin(θ)
    // y' = x * sin(θ) + y * cos(θ)
    return {
        x: x * cosine - y * sine,
        y: x * sine + y * cosine,
    };
};

export const getPoints = (shape: Shape): [Position, Position, Position, Position] => {
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

export const translatePoint = ({ x, y }: Position, { dx = 0, dy = 0 }: { dx?: number; dy?: number }): Position => ({
    x: x + dx,
    y: y + dy,
});

export function selectTransformationPoint(shape: Shape, rotation: number): Position {
    const [p1, p2, p3, p4] = getPoints(shape);

    // Determine which position will be the new x,y (as defined as the top left position) after rotation
    // If -90deg: use p2
    // If -180deg: use p3
    // If -270deg: use p4
    // Otherwise: use p1
    switch (rotation) {
        case ROTATION_ONCE_DEG:
            return p2;
        case ROTATION_TWICE_DEG:
            return p3;
        case ROTATION_THRICE_DEG:
            return p4;
        default:
            return p1;
    }
}

// Determines the translation needed to anchor the bottom left corner of the
// coordinate space at the (0, 0) origin after rotation.
export function selectTranslation(dimensions: Dimensions, rotation: number): Translation {
    const { height, width } = dimensions;

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

export function getRotatedShape(shape: Shape, rotation: number): Shape {
    const { height: shapeHeight, width: shapeWidth } = shape;
    const { height: spaceHeight, width: spaceWidth } = DEFAULT_DIMENSIONS;
    const isInverted = rotation % 180 === 0;
    const isNoRotation = rotation % 360 === 0;
    const translation = selectTranslation(DEFAULT_DIMENSIONS, rotation);
    const position = selectTransformationPoint(shape, rotation);

    if (isNoRotation) {
        return shape;
    }

    // To transform from shape with 0 rotation to provided rotation:
    // 1. Invert y-axis to convert from web to mathematical coordinate system
    // 2. Apply rotation transformation (with inverted rotation -- again mathematical coordinate system)
    // 3. Translate to align coordinate space with mathematical origin
    // 4. Invert y-axis to convert back to web coordinate system
    const invertedPoint = invertYCoordinate(position, spaceHeight);
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

export function getRotatedPosition({ x, y }: Position, rotation: number): Position {
    const { x: rotatedX, y: rotatedY } = getRotatedShape({ height: 0, width: 0, x, y }, rotation);
    return { x: rotatedX, y: rotatedY };
}
