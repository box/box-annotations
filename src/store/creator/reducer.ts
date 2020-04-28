import { createReducer } from '@reduxjs/toolkit';
import { CreatorState, CreatorStatus } from './types';
import { createAnnotationAction } from '../annotations';
import { setStagedAction, setStatusAction, setStagedCursorAction } from './actions';

export const initialState = {
    error: null,
    staged: null,
    status: CreatorStatus.init,
    cursor: 0,
};

export default createReducer<CreatorState>(initialState, builder =>
    builder
        .addCase(createAnnotationAction.fulfilled, state => {
            state.error = null;
            state.staged = null;
            state.status = CreatorStatus.init;
        })
        .addCase(createAnnotationAction.pending, state => {
            state.error = null;
            state.status = CreatorStatus.pending;
        })
        .addCase(createAnnotationAction.rejected, (state, { error }) => {
            state.error = error;
            state.status = CreatorStatus.rejected;
        })
        .addCase(setStagedAction, (state, { payload }) => {
            state.staged = payload;
        })
        .addCase(setStatusAction, (state, { payload }) => {
            state.status = payload;
        })
        .addCase(setStagedCursorAction, (state, { payload }) => {
            state.cursor = payload;
        }),
);
