import { createReducer } from '@reduxjs/toolkit';
import { addDrawingPathGroupAction, setDrawingLocationAction } from './actions';
import { DrawingState } from './types';

export const initialState = {
    drawnPathGroups: [],
    location: 0,
};

export default createReducer<DrawingState>(initialState, builder =>
    builder
        .addCase(addDrawingPathGroupAction, (state, { payload }) => {
            state.drawnPathGroups.push(payload);
        })
        .addCase(setDrawingLocationAction, (state, { payload }) => {
            if (state.location !== payload) {
                state.location = payload;
                state.drawnPathGroups = [];
            }
        }),
);
