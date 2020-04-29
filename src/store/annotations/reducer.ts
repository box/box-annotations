import { createReducer, combineReducers } from '@reduxjs/toolkit';
import { AnnotationsState } from './types';
import { createAnnotationAction, fetchAnnotationsAction, setActiveAnnotationIdAction } from './actions';

const activeAnnotationId = createReducer<AnnotationsState['activeId']>(null, builder =>
    builder
        .addCase(setActiveAnnotationIdAction, (state, { payload: annotationId }) => annotationId)
        /* Preview will set the active ID with a an event which will trigger the url change */
        .addCase(createAnnotationAction.fulfilled, () => null),
);

const annotationsAllIds = createReducer<AnnotationsState['allIds']>([], builder =>
    builder
        .addCase(createAnnotationAction.fulfilled, (state, { payload: { id } }) => {
            state.push(id);
        })
        .addCase(fetchAnnotationsAction.fulfilled, (state, { payload }) => {
            payload.entries.forEach(({ id }) => state.indexOf(id) === -1 && state.push(id));
        }),
);

const annotationsById = createReducer<AnnotationsState['byId']>({}, builder =>
    builder
        .addCase(createAnnotationAction.fulfilled, (state, { payload }) => {
            state[payload.id] = payload;
        })
        .addCase(fetchAnnotationsAction.fulfilled, (state, { payload }) => {
            payload.entries.forEach(annotation => {
                state[annotation.id] = annotation;
            });
        }),
);

export default combineReducers({
    activeId: activeAnnotationId,
    allIds: annotationsAllIds,
    byId: annotationsById,
});
