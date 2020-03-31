import { createReducer } from '@reduxjs/toolkit';
import toggleAnnotationModeAction from './actions';
import { ModeTypes } from './types';

const reducer = createReducer(ModeTypes.NONE, {
    [toggleAnnotationModeAction.type]: (state: ModeTypes, { payload: mode }: { payload: ModeTypes }) =>
        state === mode ? ModeTypes.NONE : mode,
});

export default reducer;
