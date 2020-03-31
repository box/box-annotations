import { handleActions } from 'redux-actions';
import toggleAnnotationModeAction from './actions';
import { NONE, ModeState, ModeTypes } from './types';

const initialState: ModeState = NONE;

const reducer = handleActions(
    {
        [toggleAnnotationModeAction.toString()]: (state: ModeState, { payload: mode }: { payload: ModeTypes }) =>
            state === mode ? NONE : mode,
    },
    initialState,
);

export default reducer;
