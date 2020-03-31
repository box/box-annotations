import { handleActions } from 'redux-actions';
import toggleAnnotationModeAction from './actions';
import { NONE, ModeState, ModeTypes, ToggleAnnotationModeAction } from './types';

const initialState: ModeTypes = NONE;

const reducer = handleActions(
    {
        [toggleAnnotationModeAction.toString()]: (state: ModeState, { payload: mode }: ToggleAnnotationModeAction) =>
            state === mode ? NONE : mode,
    },
    initialState,
);

export default reducer;
