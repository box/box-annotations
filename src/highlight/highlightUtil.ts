import { Annotation, AnnotationHighlight, Rect, Type } from '../@types';
import { checkValue } from '../utils/util';

export function isHighlight(annotation: Annotation): annotation is AnnotationHighlight {
    return annotation?.target?.type === Type.highlight;
}

export function isValidHighlight({ target }: AnnotationHighlight): boolean {
    const { shapes = [] } = target;

    return shapes.reduce((isValid: boolean, rect: Rect) => {
        const { height, width, x, y } = rect;
        return isValid && checkValue(height) && checkValue(width) && checkValue(x) && checkValue(y);
    }, true);
}

export function getHighlightArea(shapes: Rect[]): number {
    return shapes.reduce((area, { height, width }) => area + height * width, 0);
}

export function getSelectionRange(): Range | null {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
        return null;
    }
    return selection.getRangeAt(0);
}

export function sortHighlight(
    { target: targetA }: AnnotationHighlight,
    { target: targetB }: AnnotationHighlight,
): number {
    const { shapes: shapesA } = targetA;
    const { shapes: shapesB } = targetB;

    // Render the smallest highlights last to ensure they are always clickable
    return getHighlightArea(shapesA) > getHighlightArea(shapesB) ? -1 : 1;
}
