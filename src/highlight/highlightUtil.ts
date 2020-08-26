import { Annotation, AnnotationHighlight, Position, Type } from '../@types';

type Shape = Required<DOMRectInit>;

export const getBoundingRect = (shapes: Shape[]): Shape => {
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;

    shapes.forEach(({ height, width, x, y }) => {
        const x2 = x + width;
        const y2 = y + height;

        if (x < minX) {
            minX = x;
        }

        if (y < minY) {
            minY = y;
        }

        if (x2 > maxX) {
            maxX = x2;
        }

        if (y2 > maxY) {
            maxY = y2;
        }
    });

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
};

const centerShape = (shape: Required<DOMRectInit>): Position => {
    const { height, width } = shape;

    return {
        x: width / 2,
        y: height / 2,
    };
};

export const centerHighlight = (shapes: Shape[]): Position => {
    const boundingShape = getBoundingRect(shapes);
    const { x: shapeX, y: shapeY } = boundingShape;
    const { x: centerX, y: centerY } = centerShape(boundingShape);

    return {
        x: centerX + shapeX,
        y: centerY + shapeY,
    };
};

export function isHighlight(annotation: Annotation): annotation is AnnotationHighlight {
    return annotation?.target?.type === Type.highlight;
}
