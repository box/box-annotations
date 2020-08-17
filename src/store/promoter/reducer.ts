import { createReducer } from '@reduxjs/toolkit';
import { PromoterState } from './types';
import { setSelectionAction } from './actions';

export const initialState = {
    selection: null,
};

export default createReducer<PromoterState>(initialState, builder =>
    builder.addCase(setSelectionAction, (state, { payload }) => {
        state.selection = payload;
    }),
);
