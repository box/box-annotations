import { createReducer } from '@reduxjs/toolkit';
import { PromoterState } from './types';
import { setIsPromotingAction, setSelectionAction } from './actions';

export const initialState = {
    isPromoting: false,
    selection: null,
};

export default createReducer<PromoterState>(initialState, builder =>
    builder
        .addCase(setIsPromotingAction, (state, { payload }) => {
            state.isPromoting = payload;
        })
        .addCase(setSelectionAction, (state, { payload }) => {
            state.selection = payload;
        }),
);
