import { createReducer } from '@reduxjs/toolkit';
import { Mode, toggleAnnotationModeAction } from '../common';
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
            if (payload) {
                state.selection = null;
            }
        })
        .addCase(setSelectionAction, (state, { payload }) => {
            state.selection = payload;
        })
        .addCase(toggleAnnotationModeAction, (state, { payload }) => {
            if (payload === Mode.NONE) {
                state.isPromoting = false;
            }
        }),
);
