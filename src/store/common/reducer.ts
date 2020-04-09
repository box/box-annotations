import { createReducer, combineReducers } from '@reduxjs/toolkit';
import { CommonState, Mode } from './types';
import { toggleAnnotationModeAction, setVisibilityAction } from './actions';

const visibilityReducer = createReducer<CommonState['visibility']>(true, builder =>
    builder.addCase(setVisibilityAction, (state, { payload: visibility }) => visibility),
);
const modeReducer = createReducer<CommonState['mode']>(Mode.NONE, builder =>
    builder.addCase(toggleAnnotationModeAction, (state, { payload: mode }: { payload: Mode }) =>
        state === mode ? Mode.NONE : mode,
    ),
);

export default combineReducers({
    mode: modeReducer,
    visibility: visibilityReducer,
});
