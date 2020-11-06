import { Annotation, AnnotationDrawing, PathGroup, Position, Shape } from '../@types';

export function getCenter({ height, width, x, y }: Shape): Position {
    return { x: x + width / 2, y: y + height / 2 };
}

export function getShape(pathGroups: PathGroup[]): Shape {
    let maxX = 0;
    let maxY = 0;
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;

    pathGroups.forEach(({ paths }) => {
        paths.forEach(({ points }) => {
            points.forEach(({ x, y }) => {
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
            });
        });
    });

    return {
        height: maxY - minY,
        width: maxX - minX,
        x: minX,
        y: minY,
    };
}

export function isDrawing(annotation: Annotation): annotation is AnnotationDrawing {
    return annotation?.target?.type === 'drawing';
}
