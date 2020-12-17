import { bdlBoxBlue } from 'box-ui-elements/es/styles/variables';
import { createReducer } from '@reduxjs/toolkit';
import { CommonState, Mode } from './types';
import { setColorAction, toggleAnnotationModeAction } from './actions';

export const initialState = {
    color: bdlBoxBlue,
    mode: Mode.NONE,
};

export default createReducer<CommonState>(initialState, builder =>
    builder
        .addCase(setColorAction, (state, { payload }) => {
            state.color = payload;
        })
        .addCase(toggleAnnotationModeAction, (state, { payload }) => {
            state.mode = payload;
        }),
);
