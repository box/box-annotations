import { createReducer, combineReducers } from '@reduxjs/toolkit';
import { AnnotationsState } from './types';
import { createAnnotationAction } from './actions';

const annotationsAllIds = createReducer<AnnotationsState['allIds']>([], builder =>
    builder.addCase(createAnnotationAction.fulfilled, (state, { payload: { id } }) => {
        state.push(id);
    }),
);

const annotationsById = createReducer<AnnotationsState['byId']>({}, builder =>
    builder.addCase(createAnnotationAction.fulfilled, (state, { payload }) => {
        state[payload.id] = payload;
    }),
);

export default combineReducers({
    allIds: annotationsAllIds,
    byId: annotationsById,
});
