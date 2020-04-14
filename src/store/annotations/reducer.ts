import { createReducer, combineReducers } from '@reduxjs/toolkit';
import { AnnotationsState } from './types';
import { createAnnotationAction, setActiveAnnotationIdAction } from './actions';

const activeAnnotationId = createReducer<AnnotationsState['activeId']>(null, builder =>
    builder.addCase(setActiveAnnotationIdAction, (state, { payload: annotationId }) => annotationId),
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
    activeId: activeAnnotationId,
    allIds: annotationsAllIds,
    byId: annotationsById,
});
