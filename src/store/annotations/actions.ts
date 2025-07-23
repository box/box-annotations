import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Annotation, NewAnnotation } from '../../@types';
import { APICollection } from '../../api';
import { AppThunkAPI } from '../types';
import { getFileId, getFileVersionId, getPermissions } from '../options';

export const createAnnotationAction = createAsyncThunk<Annotation, NewAnnotation, AppThunkAPI>(
    'CREATE_ANNOTATION',
    async (newAnnotation: NewAnnotation, { extra, getState, signal }) => {
        // Create a new client for each request
        const client = extra.api.getAnnotationsAPI();
        const state = getState();
        const fileId = getFileId(state);
        const fileVersionId = getFileVersionId(state);
        const permissions = getPermissions(state);

        signal.addEventListener('abort', () => {
            client.destroy();
        });

        return new Promise<Annotation>((resolve, reject) => {
            client.createAnnotation(fileId, fileVersionId, newAnnotation, permissions, resolve, reject);
        });
    },
);

export const fetchAnnotationsAction = createAsyncThunk<APICollection<Annotation>, undefined, AppThunkAPI>(
    'FETCH_ANNOTATIONS',
    async (arg, { extra, getState, signal }) => {
        // Create a new client for each request
        const client = extra.api.getAnnotationsAPI();
        const state = getState();
        const fileId = getFileId(state);
        const fileVersionId = getFileVersionId(state);
        const permissions = getPermissions(state);

        // Destroy the client if action's abort method is invoked
        signal.addEventListener('abort', () => {
            client.destroy();
        });

        // Wrap the client request in a promise to allow it to be returned and cancelled
        return new Promise<APICollection<Annotation>>((resolve, reject) => {
            client.getAnnotations(fileId, fileVersionId, permissions, resolve, reject, 1000, false);
        });
    },
);

export const addLocalAnnotationAction = createAction<Annotation>('ADD_LOCAL_ANNOTATION');
export const removeAnnotationAction = createAction<string>('REMOVE_ANNOTATION');
export const setActiveAnnotationIdAction = createAction<string | null>('SET_ACTIVE_ANNOTATION_ID');
export const setIsInitialized = createAction('SET_IS_INITIALIZED');
