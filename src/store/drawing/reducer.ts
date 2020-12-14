import { createReducer } from '@reduxjs/toolkit';
import { createAnnotationAction } from '../annotations';
import { toggleAnnotationModeAction } from '../common';
import { resetCreatorAction } from '../creator';
import {
    addDrawingPathGroupAction,
    redoDrawingPathGroupAction,
    resetDrawingAction,
    setDrawingLocationAction,
    undoDrawingPathGroupAction,
} from './actions';
import { DrawingState } from './types';

export const initialState = {
    drawnPathGroups: [],
    location: 0,
    stashedPathGroups: [],
};

export default createReducer<DrawingState>(initialState, builder =>
    builder
        .addCase(createAnnotationAction.fulfilled, () => initialState)
        .addCase(addDrawingPathGroupAction, (state, { payload }) => {
            state.drawnPathGroups.push(payload);
            state.stashedPathGroups = [];
        })
        .addCase(redoDrawingPathGroupAction, state => {
            const pathGroup = state.stashedPathGroups.pop();

            if (pathGroup) {
                state.drawnPathGroups.push(pathGroup);
            }
        })
        .addCase(resetCreatorAction, () => initialState) // Needed for when `PopupReply` is cancelled
        .addCase(resetDrawingAction, () => initialState)
        .addCase(setDrawingLocationAction, (state, { payload }) => {
            if (state.location !== payload) {
                state.location = payload;
                state.drawnPathGroups = [];
            }
        })
        .addCase(toggleAnnotationModeAction, () => initialState)
        .addCase(undoDrawingPathGroupAction, state => {
            const pathGroup = state.drawnPathGroups.pop();

            if (pathGroup) {
                state.stashedPathGroups.push(pathGroup);
            }
        }),
);
