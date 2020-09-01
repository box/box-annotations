import { Annotation, AnnotationHighlight, Position, Shape, Type } from '../@types';

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

const centerShape = (shape: Shape): Position => {
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

export const getThreshold = (prev: number, curr: number, threshold: number): number =>
    Math.max(Math.round(prev * threshold), Math.round(curr * threshold), 1);

export const dedupeRects = (rects: Shape[], threshold = 0.1): Shape[] => {
    const dedupedRects: Shape[] = [];

    rects.forEach(curr => {
        const prev = dedupedRects.pop();
        // empty list, push current
        if (!prev) {
            dedupedRects.push(curr);
            // The return in forEach callback is acting like a continue in for loop
            return;
        }

        const { width: prevWidth, height: prevHeight, x: prevX, y: prevY } = prev;
        const { width, height, x, y } = curr;

        const xThreshold = getThreshold(prevWidth, width, threshold);
        const yThreshold = getThreshold(prevHeight, height, threshold);

        if (Math.abs(prevX - x) <= xThreshold && Math.abs(prevY - y) <= yThreshold) {
            // the same rect, push the larger one
            dedupedRects.push(prevHeight * prevWidth > height * width ? prev : curr);
        } else {
            // different rects, push both
            dedupedRects.push(prev);
            dedupedRects.push(curr);
        }
    });

    return dedupedRects;
};

export const combineRectsByRow = (rects: Shape[]): Shape[] => {
    const dedupedRects = dedupeRects(rects);

    const rows = dedupedRects.reduce((groups, rect) => {
        const { y } = rect;
        const roundedY = Math.round(y);
        groups[roundedY] = groups[roundedY] || [];
        groups[roundedY].push(rect);
        return groups;
    }, {} as Record<number, Shape[]>);

    return Object.values(rows).map(group => getBoundingRect(group));
};

export const getShapeRelativeToContainer = (shape: Shape, containerShape: Shape): Shape => {
    const { height, width, x, y } = shape;
    const { height: containerHeight, width: containerWidth, x: containerX, y: containerY } = containerShape;

    return {
        height: (height / containerHeight) * 100,
        width: (width / containerWidth) * 100,
        x: ((x - containerX) / containerWidth) * 100,
        y: ((y - containerY) / containerHeight) * 100,
    };
};
