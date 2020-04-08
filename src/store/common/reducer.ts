import { createReducer } from '@reduxjs/toolkit';
import { CommonState, TOGGLE_ANNOTATION_VISIBILITY } from './types';

export const initialState = { visible: true };

const reducer = createReducer(initialState, {
    [TOGGLE_ANNOTATION_VISIBILITY]: (state: CommonState) => ({
        visible: !state.visible,
    }),
});

export default reducer;
