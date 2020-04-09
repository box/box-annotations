import { createReducer, combineReducers } from '@reduxjs/toolkit';
import { AnnotationsState } from './types';
import { setAnnotation, setAnnotations } from './actions';

const annotationsAllIds = createReducer<AnnotationsState['allIds']>([], builder =>
    builder
        .addCase(setAnnotation, (state, { payload: { id } }) => {
            if (!state.includes(id)) state.push(id);
        })
        .addCase(setAnnotations, (state, { payload }) => {
            return payload.map(annotation => annotation.id);
        }),
);

const annotationsById = createReducer<AnnotationsState['byId']>({}, builder =>
    builder
        .addCase(setAnnotation, (state, { payload }) => {
            state[payload.id] = payload;
        })
        .addCase(setAnnotations, (state, { payload }) => {
            return payload.reduce((acc: AnnotationsState['byId'], annotation) => {
                acc[annotation.id] = annotation;
                return acc;
            }, {});
        }),
);

export default combineReducers({
    allIds: annotationsAllIds,
    byId: annotationsById,
});
