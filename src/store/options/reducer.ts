import { createReducer } from '@reduxjs/toolkit';
import { OptionsState } from './types';
import {
    setFileIdAction,
    setFileVersionIdAction,
    setPermissionsAction,
    setRotationAction,
    setScaleAction,
} from './actions';

export const initialState = {
    fileId: null,
    fileVersionId: null,
    permissions: {},
    rotation: 0,
    scale: 1,
};

export default createReducer<OptionsState>(initialState, builder =>
    builder
        .addCase(setFileIdAction, (state, { payload }) => {
            state.fileId = payload;
        })
        .addCase(setFileVersionIdAction, (state, { payload }) => {
            state.fileVersionId = payload;
        })
        .addCase(setPermissionsAction, (state, { payload }) => {
            state.permissions = payload;
        })
        .addCase(setRotationAction, (state, { payload }) => {
            state.rotation = payload;
        })
        .addCase(setScaleAction, (state, { payload }) => {
            state.scale = payload;
        }),
);
