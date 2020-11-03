import { createReducer } from '@reduxjs/toolkit';
import { OptionsState } from './types';
import {
    setDocumentFtuxCursorDisabledAction,
    setFileIdAction,
    setFileVersionIdAction,
    setImageFtuxCursorDisabledAction,
    setPermissionsAction,
    setRotationAction,
    setScaleAction,
} from './actions';

export const initialState = {
    features: {},
    fileId: null,
    fileVersionId: null,
    isCurrentFileVersion: true,
    isDocumentFtuxCursorDisabled: false,
    isImageFtuxCursorDisabled: false,
    permissions: {},
    rotation: 0,
    scale: 1,
};

export default createReducer<OptionsState>(initialState, builder =>
    builder
        .addCase(setDocumentFtuxCursorDisabledAction, state => {
            state.isDocumentFtuxCursorDisabled = true;
        })
        .addCase(setFileIdAction, (state, { payload }) => {
            state.fileId = payload;
        })
        .addCase(setFileVersionIdAction, (state, { payload }) => {
            state.fileVersionId = payload;
        })
        .addCase(setImageFtuxCursorDisabledAction, state => {
            state.isImageFtuxCursorDisabled = true;
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
