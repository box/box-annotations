import { createReducer, combineReducers } from '@reduxjs/toolkit';
import { addClientIds } from '../../drawing/drawingUtil';
import { AnnotationsState } from './types';
import {
    createAnnotationAction,
    fetchAnnotationsAction,
    removeAnnotationAction,
    setActiveAnnotationIdAction,
    setIsInitialized,
} from './actions';

const activeAnnotationId = createReducer<AnnotationsState['activeId']>(null, builder =>
    builder
        /* Preview will set the active ID with a an event which will trigger the url change */
        .addCase(createAnnotationAction.fulfilled, () => null)
        .addCase(removeAnnotationAction, (state, { payload: id }) => (state === id ? null : state))
        .addCase(setActiveAnnotationIdAction, (state, { payload: annotationId }) => annotationId),
);

const annotationsAllIds = createReducer<AnnotationsState['allIds']>([], builder =>
    builder
        .addCase(createAnnotationAction.fulfilled, (state, { payload: { id } }) => {
            state.push(id);
        })
        .addCase(removeAnnotationAction, (state, { payload: id }) => state.filter(annotationId => annotationId !== id))
        .addCase(fetchAnnotationsAction.fulfilled, (state, { payload }) => {
            payload.entries.forEach(({ id }) => state.indexOf(id) === -1 && state.push(id));
        }),
);

const annotationsById = createReducer<AnnotationsState['byId']>({}, builder =>
    builder
        .addCase(createAnnotationAction.fulfilled, (state, { payload }) => {
            state[payload.id] = payload;
        })
        .addCase(removeAnnotationAction, (state, { payload: id }) => {
            delete state[id];
        })
        .addCase(fetchAnnotationsAction.fulfilled, (state, { payload }) => {
            payload.entries.forEach(annotation => {
                let newAnnotation = annotation;

                if (annotation.target.type === 'drawing') {
                    const {
                        target: { path_groups: pathGroups, ...targetRest },
                        ...rest
                    } = annotation;

                    newAnnotation = {
                        target: {
                            // eslint-disable-next-line @typescript-eslint/camelcase
                            path_groups: addClientIds(pathGroups),
                            ...targetRest,
                        },
                        ...rest,
                    };
                }

                state[annotation.id] = newAnnotation;
            });
        }),
);

const setAnnotationsIsInitialized = createReducer(false, builder => {
    builder.addCase(setIsInitialized, () => true);
});

export default combineReducers({
    activeId: activeAnnotationId,
    allIds: annotationsAllIds,
    byId: annotationsById,
    isInitialized: setAnnotationsIsInitialized,
});
