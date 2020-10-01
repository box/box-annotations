import { createReducer } from '@reduxjs/toolkit';
import { createAnnotationAction } from '../annotations';
import { HighlightState } from './types';
import { resetCreatorAction, setStatusAction } from '../creator';
import { setIsPromotingAction, setIsSelectingAction, setSelectionAction } from './actions';
import { toggleAnnotationModeAction } from '../common';

export const initialState = {
    isPromoting: false,
    isSelecting: false,
    selection: null,
};

export default createReducer<HighlightState>(initialState, builder =>
    builder
        .addCase(setIsPromotingAction, (state, { payload }) => {
            state.isPromoting = payload;
            if (payload) {
                state.selection = null;
            }
        })
        .addCase(setIsSelectingAction, (state, { payload }) => {
            state.isSelecting = payload;
        })
        .addCase(setSelectionAction, (state, { payload }) => {
            state.selection = payload;
        })
        .addCase(createAnnotationAction.fulfilled, state => {
            state.isPromoting = false;
        })
        .addCase(resetCreatorAction, state => {
            state.isPromoting = false;
        })
        .addCase(toggleAnnotationModeAction, state => {
            state.isPromoting = false;
        })
        .addCase(setStatusAction, state => {
            state.selection = null;
        }),
);
