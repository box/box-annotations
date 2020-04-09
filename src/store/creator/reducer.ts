import { createReducer } from '@reduxjs/toolkit';
import { setStaged, setStatus } from './actions';
import { CreatorState, CreatorStatus } from './types';

export const initialState = {
    staged: null,
    status: CreatorStatus.init,
};

export default createReducer<CreatorState>(initialState, builder =>
    builder
        .addCase(setStaged, (state, { payload }) => {
            state.staged = payload;
        })
        .addCase(setStatus, (state, { payload }) => {
            state.status = payload;
        }),
);
