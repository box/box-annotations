import { createReducer } from '@reduxjs/toolkit';
import { toggleAnnotationModeAction } from './actions';
import { Mode, ModeState } from './types';

const initialState = { current: Mode.NONE };

const reducer = createReducer(initialState, {
    [toggleAnnotationModeAction.type]: (state: ModeState, { payload: mode }: { payload: Mode }) => ({
        ...state,
        current: state.current === mode ? Mode.NONE : mode,
    }),
});

export default reducer;
