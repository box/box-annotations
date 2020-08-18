import { Annotation, AnnotationHighlight, Rect, Type } from '../@types';
import { checkValue } from '../utils/util';
import { getPageNumber } from '../document/docUtil';

type SelectionItem = {
    boundingRect: Rect;
    location: number;
    rects: Array<Rect>;
};

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

export function getRange(): Range | null {
    const selection = window.getSelection();
    if (!selection || selection.type !== 'Range' || selection.isCollapsed) {
        return null;
    }

    return selection.getRangeAt(0);
}

export const DOMRectToRect = ({ height, width, x, y }: DOMRect): Rect => ({
    height,
    type: 'rect',
    width,
    x,
    y,
});

export function getSelectionItem(): SelectionItem | null {
    const range = getRange();

    if (!range) {
        return null;
    }

    const startPage = getPageNumber(range.startContainer as Element);
    const endPage = getPageNumber(range.endContainer as Element);

    if (!startPage || !endPage || startPage !== endPage) {
        return null;
    }

    const boundingRect = DOMRectToRect(range.getBoundingClientRect());
    const rects = Array.from(range.getClientRects())
        .filter(({ height, width, x, y }) => x > 0 && y > 0 && height < window.innerHeight && width < window.innerWidth)
        .map(DOMRectToRect);

    return { boundingRect, location: endPage, rects };
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
