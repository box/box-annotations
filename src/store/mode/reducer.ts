import { handleActions } from 'redux-actions';
import toggleAnnotationModeAction from './actions';
import { NONE, ModeState, ToggleAnnotationModeAction } from './types';
import { ApplicationState } from '../types';

const initialState: ModeState = NONE;

const reducer = handleActions(
    {
        [toggleAnnotationModeAction.toString()]: (
            state: ApplicationState,
            { payload: mode }: ToggleAnnotationModeAction,
        ) => (state === mode ? NONE : mode),
    },
    initialState,
);

export default reducer;
