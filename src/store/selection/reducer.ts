import { createReducer } from '@reduxjs/toolkit';
import { SelectionState } from './types';
import { setSelectionAction } from './actions';

export const initialState = {
    selection: null,
};

export default createReducer<SelectionState>(initialState, builder =>
    builder.addCase(setSelectionAction, (state, { payload }) => {
        state.selection = payload;
    }),
);
