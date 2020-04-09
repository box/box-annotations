import { createReducer } from '@reduxjs/toolkit';
import { setStagedAction, setStatusAction } from './actions';
import { CreatorState, CreatorStatus } from './types';

export const initialState = {
    staged: null,
    status: CreatorStatus.init,
};

export default createReducer<CreatorState>(initialState, builder =>
    builder
        .addCase(setStagedAction, (state, { payload }) => {
            state.staged = payload;
        })
        .addCase(setStatusAction, (state, { payload }) => {
            state.status = payload;
        }),
);
