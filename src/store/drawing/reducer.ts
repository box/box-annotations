import { createReducer } from '@reduxjs/toolkit';
import { toggleAnnotationModeAction } from '../common';
import { resetCreatorAction } from '../creator';
import { addDrawingPathGroupAction, resetDrawingAction, setDrawingLocationAction } from './actions';
import { DrawingState } from './types';

export const initialState = {
    drawnPathGroups: [],
    location: 0,
};

export default createReducer<DrawingState>(initialState, builder =>
    builder
        .addCase(addDrawingPathGroupAction, (state, { payload }) => {
            state.drawnPathGroups.push(payload);
        })
        .addCase(resetCreatorAction, () => initialState) // Needed for when `PopupReply` is cancelled
        .addCase(resetDrawingAction, () => initialState)
        .addCase(setDrawingLocationAction, (state, { payload }) => {
            if (state.location !== payload) {
                state.location = payload;
                state.drawnPathGroups = [];
            }
        })
        .addCase(toggleAnnotationModeAction, () => initialState),
);
