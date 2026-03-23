import { createReducer } from '@reduxjs/toolkit';
import { OptionsState, ViewMode } from './types';
import {
    setFileIdAction,
    setFileVersionIdAction,
    setPermissionsAction,
    setRotationAction,
    setScaleAction,
    setViewModeAction,
} from './actions';

export const initialState = {
    features: {},
    fileId: null,
    fileVersionId: null,
    isCurrentFileVersion: true,
    permissions: {},
    rotation: 0,
    scale: 1,
    viewMode: 'annotations' as ViewMode,
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
        })
        .addCase(setViewModeAction, (state, { payload }) => {
            state.viewMode = payload;
        }),
);
