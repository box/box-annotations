import { createReducer, combineReducers } from '@reduxjs/toolkit';
import { CommonState, Mode } from './types';
import { toggleAnnotationModeAction } from './actions';

const modeReducer = createReducer<CommonState['mode']>(Mode.NONE, builder =>
    builder.addCase(toggleAnnotationModeAction, (state, { payload: mode }: { payload: Mode }) => mode),
);

export default combineReducers({
    mode: modeReducer,
});
