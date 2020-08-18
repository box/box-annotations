import { createAction, PayloadAction } from '@reduxjs/toolkit';
import { DOMRectMini } from '../../@types';
import { SelectionItem } from './types';

export const domRectToMini = ({ height, width, x, y }: DOMRect): DOMRectMini => ({
    height,
    width,
    x,
    y,
});

export type CreateArg = {
    location: number;
    range: Range;
};

export const setSelectionAction = createAction<SelectionItem | null>('SET_SELECTION');
export const createSelectionAction = (arg: CreateArg): PayloadAction<SelectionItem | null> => {
    const { location, range } = arg;

    return setSelectionAction({
        boundingRect: domRectToMini(range.getBoundingClientRect()),
        location,
        rects: Array.from(range.getClientRects()).map(domRectToMini),
    });
};
