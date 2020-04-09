import uniqueId from 'lodash/uniqueId';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Annotation, NewAnnotation } from '../../@types';

// Basic Actions
export const setAnnotation = createAction<Annotation>('SET_ANNOTATION');
export const setAnnotations = createAction<Annotation[]>('SET_ANNOTATIONS');

// Async Actions
export const saveAnnotation = createAsyncThunk('annotation/create', async (annotation: NewAnnotation, { dispatch }) => {
    // TODO: Replace with API call
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const result: Annotation = {
        ...annotation,
        id: uniqueId(),
        type: 'annotation',
    };
    dispatch(setAnnotation(result));
});
