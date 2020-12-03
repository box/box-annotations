import * as uuid from 'uuid';
import { Annotation, AnnotationDrawing, PathGroup, Position, Shape } from '../@types';

export function addClientIds({ paths, ...groupRest }: PathGroup): PathGroup {
    return {
        clientId: uuid.v4(),
        paths: paths.map(path => ({
            clientId: uuid.v4(),
            ...path,
        })),
        ...groupRest,
    };
}

export function formatDrawing(annotation: AnnotationDrawing): AnnotationDrawing {
    const {
        target: { path_groups: pathGroups, ...targetRest },
        ...rest
    } = annotation;

    return {
        target: {
            // eslint-disable-next-line @typescript-eslint/camelcase
            path_groups: pathGroups.map(pathGroup => addClientIds(pathGroup)),
            ...targetRest,
        },
        ...rest,
    };
}

export function getCenter({ height, width, x, y }: Shape): Position {
    return { x: x + width / 2, y: y + height / 2 };
}

// We use cubic Bezier curves to generate path commands for better smoothing.
// For every data point, we generate extra two points using adjacent data points.
// Then we use the first generated point and the data point as two control points
// and the second generated point as the destination point to form a (C)urve command.
export const getPathCommands = (points?: Position[]): string => {
    if (!points || !points.length) {
        return '';
    }

    const { x: startX, y: startY } = points[0];
    const d = points
        .map(({ x, y }, index, array) => {
            const prevPoint = array[index - 1];
            const nextPoint = array[index + 1];
            if (!prevPoint || !nextPoint) {
                return '';
            }

            const xc1 = (x + prevPoint.x) / 2;
            const yc1 = (y + prevPoint.y) / 2;
            const xc2 = (x + nextPoint.x) / 2;
            const yc2 = (y + nextPoint.y) / 2;

            return `C ${xc1} ${yc1}, ${x} ${y}, ${xc2} ${yc2}`;
        })
        .join(' ');

    return `M ${startX} ${startY} ${d}`;
};

export function getShape(pathGroups: PathGroup[]): Shape {
    let maxX = 0;
    let maxY = 0;
    // Initialize mins with MAX_VALUE so that any possible
    // input value of the first point can be captured by Math.min
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
        height: Math.max(0, maxY - minY),
        width: Math.max(0, maxX - minX),
        x: minX === Number.MAX_VALUE ? 0 : minX,
        y: minY === Number.MAX_VALUE ? 0 : minY,
    };
}

export function isDrawing(annotation: Annotation): annotation is AnnotationDrawing {
    return annotation?.target?.type === 'drawing';
}

export function centerDrawing(pathGroups: PathGroup[]): Position {
    return getCenter(getShape(pathGroups));
}

export function isVectorEffectSupported(): boolean {
    return 'vector-effect' in document.body.style;
}
