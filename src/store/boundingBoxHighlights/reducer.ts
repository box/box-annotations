import { createReducer } from '@reduxjs/toolkit';
import { BoundingBoxHighlightsState } from './types';
import {
    navigateBoundingBoxHighlightAction,
    setBoundingBoxHighlightsAction,
    setSelectedBoundingBoxHighlightAction,
} from './actions';
import { setViewModeAction } from '../options/actions';

const initialState: BoundingBoxHighlightsState = {
    boundingBoxes: [],
    selectedId: null,
};

export default createReducer(initialState, builder => {
    builder
        .addCase(setBoundingBoxHighlightsAction, (state, { payload }) => {
            state.boundingBoxes = payload;
            state.selectedId = null;
        })
        .addCase(setSelectedBoundingBoxHighlightAction, (state, { payload }) => {
            state.selectedId = payload;
        })
        .addCase(navigateBoundingBoxHighlightAction, (state, { payload }) => {
            state.selectedId = payload;
        })
        .addCase(setViewModeAction, (state, { payload }) => {
            // Clear selected bounding box when switching to annotations mode
            if (payload === 'annotations') {
                state.selectedId = null;
            }
        });
});
