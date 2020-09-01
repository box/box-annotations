import { createAction } from '@reduxjs/toolkit';
import { combineRectsByRow } from '../../highlight/highlightUtil';
import { SelectionItem } from './types';
import { Shape } from '../../@types';

export type SelectionArg = {
    containerRect: DOMRect;
    location: number;
    range: Range;
};

type Payload = {
    payload: SelectionItem | null;
};

export const getShape = ({ height, left, top, width }: DOMRect): Shape => ({
    height,
    width,
    x: left,
    y: top,
});

export const setSelectionAction = createAction(
    'SET_SELECTION',
    (arg: SelectionArg | null): Payload => {
        if (!arg) {
            return {
                payload: null,
            };
        }

        const { containerRect, location, range } = arg;

        return {
            payload: {
                containerRect: getShape(containerRect),
                location,
                rects: combineRectsByRow(Array.from(range.getClientRects()).map(getShape)),
            },
        };
    },
);

export const setIsPromotingAction = createAction<boolean>('SET_IS_PROMOTING');
