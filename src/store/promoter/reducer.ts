import { createReducer } from '@reduxjs/toolkit';
import { createAnnotationAction } from '../annotations';
import { PromoterState } from './types';
import { resetCreatorAction } from '../creator';
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
        .addCase(createAnnotationAction.fulfilled, state => {
            state.isPromoting = false;
        })
        .addCase(resetCreatorAction, state => {
            state.isPromoting = false;
        }),
);
