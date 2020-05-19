import { createReducer } from '@reduxjs/toolkit';
import { OptionsState } from './types';
import { setFileIdAction, setFileVersionIdAction, setPermissionsAction } from './actions';

export const initialState = {
    fileId: null,
    fileVersionId: null,
    permissions: {},
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
        }),
);
