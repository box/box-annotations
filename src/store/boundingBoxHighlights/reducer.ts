import { createReducer } from '@reduxjs/toolkit';
import { BoundingBoxHighlightsState } from './types';
import {
    navigateBoundingBoxHighlightAction,
    setBoundingBoxHighlightsAction,
    setSelectedBoundingBoxHighlightAction,
} from './actions';

const initialState: BoundingBoxHighlightsState = {
    boundingBoxes: [],
    selectedId: null,
};

export default createReducer(initialState, builder => {
    builder
        .addCase(setBoundingBoxHighlightsAction, (state, { payload }) => {
            state.boundingBoxes = payload;
        })
        .addCase(setSelectedBoundingBoxHighlightAction, (state, { payload }) => {
            state.selectedId = payload;
        })
        .addCase(navigateBoundingBoxHighlightAction, (state, { payload }) => {
            state.selectedId = payload;
        });
});
