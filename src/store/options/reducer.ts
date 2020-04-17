import { createReducer } from '@reduxjs/toolkit';
import { OptionsState } from './types';
import { setFileIdAction, setFileVersionIdAction } from './actions';

export const initialState = {
    fileId: null,
    fileVersionId: null,
};

export default createReducer<OptionsState>(initialState, builder =>
    builder
        .addCase(setFileIdAction, (state, { payload }) => {
            state.fileId = payload;
        })
        .addCase(setFileVersionIdAction, (state, { payload }) => {
            state.fileVersionId = payload;
        }),
);
