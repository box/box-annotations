import { createAction } from '@reduxjs/toolkit';
import { SelectionItem } from './types';

export type CreateArg = {
    location: number;
    range: Range;
};

type Payload = {
    payload: SelectionItem | null;
};

export const getDOMRectInit = ({ height, width, x, y }: DOMRect): Required<DOMRectInit> => ({
    height,
    width,
    x,
    y,
});

export const setSelectionAction = createAction(
    'SET_SELECTION',
    (arg: CreateArg | null): Payload => {
        if (!arg) {
            return {
                payload: null,
            };
        }

        const { location, range } = arg;

        return {
            payload: {
                boundingRect: getDOMRectInit(range.getBoundingClientRect()),
                location,
                rects: Array.from(range.getClientRects()).map(getDOMRectInit),
            },
        };
    },
);
