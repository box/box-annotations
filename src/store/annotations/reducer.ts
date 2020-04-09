import { createReducer, combineReducers } from '@reduxjs/toolkit';
import { AnnotationsState } from './types';
import { setAnnotationAction, setAnnotationsAction } from './actions';

const annotationsAllIds = createReducer<AnnotationsState['allIds']>([], builder =>
    builder
        .addCase(setAnnotationAction, (state, { payload: { id } }) => {
            if (!state.includes(id)) {
                state.push(id);
            }
        })
        .addCase(setAnnotationsAction, (state, { payload }) => {
            return payload.map(annotation => annotation.id);
        }),
);

const annotationsById = createReducer<AnnotationsState['byId']>({}, builder =>
    builder
        .addCase(setAnnotationAction, (state, { payload }) => {
            state[payload.id] = payload;
        })
        .addCase(setAnnotationsAction, (state, { payload }) => {
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
