import { Annotation, AnnotationHighlight, Position, Shape, Type } from '../@types';

export const getBoundingRect = (shapes: Shape[]): Shape => {
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

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

export const combineRects = (rects: Shape[]): Shape[] => {
    const result: Shape[] = [];

    dedupeRects(rects).forEach(rect => {
        const { height, width, x, y } = rect;
        const lastRect = result.pop();

        if (!lastRect) {
            result.push(rect);
            return;
        }

        // This algorithm employs a hueristic that assumes rects are returned in ascending y coordinate
        // followed by ascending x coordinate.
        // If there is already a previous rect, check first to see if the current rect is approximately
        // close enough (in both the x and y coordinate) to be considered as part of the same rect
        // If it is not close enough then add the current rect as a separate rect in the array
        const { height: lastHeight, width: lastWidth, x: lastX, y: lastY } = lastRect;
        const lastMaxX = lastX + lastWidth;
        const thresholdX = getThreshold(lastWidth, width, 0.3);
        const thresholdY = getThreshold(lastHeight, height, 0.6);
        const isXCloseEnough = Math.abs(x - lastMaxX) < thresholdX;
        const isYCloseEnough = Math.abs(y - lastY) < thresholdY;

        // If rect is close enough, add the rect to the existing entry, otherwise add it as a new entry
        if (isXCloseEnough && isYCloseEnough) {
            result.push(getBoundingRect([lastRect, rect]));
        } else {
            result.push(lastRect);
            result.push(rect);
        }
    });

    return result;
};

export const getShapeRelativeToContainer = (shape: Shape, containerShape: Shape): Shape => {
    const { height, width, x, y } = shape;
    const { height: containerHeight, width: containerWidth, x: containerX, y: containerY } = containerShape;

    // If for some reason the x or y turns out to be negative in relation to the container, assume 0 instead
    return {
        height: (height / containerHeight) * 100,
        width: (width / containerWidth) * 100,
        x: (Math.max(0, x - containerX) / containerWidth) * 100,
        y: (Math.max(0, y - containerY) / containerHeight) * 100,
    };
};
