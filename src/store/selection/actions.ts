import { createAction } from '@reduxjs/toolkit';
import { DOMRectMini, SelectionItem } from './types';

export type SelectionArg = {
    location: number;
    range: Range;
};

type Payload = {
    payload: SelectionItem | null;
};

export const getDOMRectMini = ({ height, width, x, y }: DOMRect): DOMRectMini => ({
    height,
    width,
    x,
    y,
});

export const setSelectionAction = createAction(
    'SET_SELECTION',
    (arg: SelectionArg | null): Payload => {
        if (!arg) {
            return {
                payload: null,
            };
        }

        const { location, range } = arg;

        return {
            payload: {
                boundingRect: getDOMRectMini(range.getBoundingClientRect()),
                location,
                rects: Array.from(range.getClientRects()).map(getDOMRectMini),
            },
        };
    },
);
