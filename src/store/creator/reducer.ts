import { createReducer } from '@reduxjs/toolkit';
import { createAnnotationAction } from '../annotations';
import { CreatorState, CreatorStatus } from './types';
import { resetCreatorAction, setReferenceIdAction, setStagedAction, setStatusAction } from './actions';
import { toggleAnnotationModeAction } from '../common';

export const initialState = {
    error: null,
    referenceId: null,
    staged: null,
    status: CreatorStatus.init,
};

export default createReducer<CreatorState>(initialState, builder =>
    builder
        .addCase(createAnnotationAction.fulfilled, () => initialState)
        .addCase(createAnnotationAction.pending, state => {
            state.error = null;
            state.status = CreatorStatus.pending;
        })
        .addCase(createAnnotationAction.rejected, (state, { error }) => {
            state.error = error;
            state.status = CreatorStatus.rejected;
        })
        .addCase(resetCreatorAction, state => {
            state.referenceId = null;
            state.staged = null;
            state.status = CreatorStatus.init;
        })
        .addCase(setReferenceIdAction, (state, { payload }) => {
            state.referenceId = payload;
        })
        .addCase(setStagedAction, (state, { payload }) => {
            state.staged = payload;
        })
        .addCase(setStatusAction, (state, { payload }) => {
            state.status = payload;
        })
        .addCase(toggleAnnotationModeAction, () => initialState),
);
