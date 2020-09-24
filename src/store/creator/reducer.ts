import { createReducer } from '@reduxjs/toolkit';
import { CreatorState, CreatorStatus } from './types';
import { createAnnotationAction } from '../annotations';
import {
    resetCreatorAction,
    setCursorAction,
    setMessageAction,
    setReferenceShapeAction,
    setStagedAction,
    setStatusAction,
} from './actions';

export const initialState = {
    cursor: 0,
    error: null,
    message: '',
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
            state.message = '';
            state.staged = null;
            state.status = CreatorStatus.init;
        })
        .addCase(setMessageAction, (state, { payload }) => {
            state.message = payload;
        })
        .addCase(setReferenceShapeAction, (state, { payload }) => {
            state.referenceShape = payload;
        })
        .addCase(setStagedAction, (state, { payload }) => {
            state.staged = payload;
        })
        .addCase(setStatusAction, (state, { payload }) => {
            state.status = payload;
        })
        .addCase(setCursorAction, (state, { payload }) => {
            state.cursor = payload;
        }),
);
