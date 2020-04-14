import { createReducer, combineReducers } from '@reduxjs/toolkit';
import { AnnotationsState } from './types';
import { createAnnotationAction, setActiveAnnotationAction } from './actions';

const activeAnnotationId = createReducer<AnnotationsState['activeAnnotationId']>(null, builder =>
    builder.addCase(setActiveAnnotationAction, (state, { payload: annotationId }) => annotationId),
);

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
    activeAnnotationId,
    allIds: annotationsAllIds,
    byId: annotationsById,
});
