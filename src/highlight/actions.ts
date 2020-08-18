import { AppThunkDispatch, SelectionItem, setSelectionAction } from '../store';
import { getPageNumber } from '../document/docUtil';
import { Rect } from '../@types';

export const DOMRectToRect = ({ height, width, x, y }: DOMRect): Rect => ({
    height,
    type: 'rect',
    width,
    x,
    y,
});

export function getRange(): Range | null {
    const selection = window.getSelection();
    if (!selection || selection.type !== 'Range' || selection.isCollapsed) {
        return null;
    }

    return selection.getRangeAt(0);
}

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

export const clearSelectionAction = () => (dispatch: AppThunkDispatch) => {
    return dispatch(setSelectionAction(null));
};

export const createSelectionAction = () => (dispatch: AppThunkDispatch) => {
    return dispatch(setSelectionAction(getSelectionItem()));
};
