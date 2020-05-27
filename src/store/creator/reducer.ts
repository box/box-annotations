import merge from 'lodash/merge';
import { createReducer } from '@reduxjs/toolkit';
import { CreatorState, CreatorStatus } from './types';
import { createAnnotationAction } from '../annotations';
import { setMessageAction, setCursorAction, setStagedAction, setStatusAction, updateStagedAction } from './actions';

export const initialState = {
    cursor: 0,
    error: null,
    message: '',
    staged: null,
    status: CreatorStatus.init,
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
        .addCase(setMessageAction, (state, { payload }) => {
            state.message = payload;
        })
        .addCase(setStagedAction, (state, { payload }) => {
            state.staged = payload;
        })
        .addCase(setStatusAction, (state, { payload }) => {
            state.status = payload;
        })
        .addCase(setCursorAction, (state, { payload }) => {
            state.cursor = payload;
        })
        .addCase(updateStagedAction, (state, { payload }) => {
            state.staged = merge(state.staged, payload);
        }),
);
