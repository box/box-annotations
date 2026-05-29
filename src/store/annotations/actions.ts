import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Annotation, NewAnnotation, Reply } from '../../@types';
import { APICollection } from '../../api';
import { AppThunkAPI } from '../types';
import { getAnnotation } from './selectors';
import { getFileId, getFileVersionId, getPermissions, isFeatureEnabled } from '../options';

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

        const shouldFetchReplies = isFeatureEnabled({ options: getState().options }, 'isThreadedAnnotation');

        // Wrap the client request in a promise to allow it to be returned and cancelled
        return new Promise<APICollection<Annotation>>((resolve, reject) => {
            client.getAnnotations(fileId, fileVersionId, permissions, resolve, reject, 1000, false, shouldFetchReplies);
        });
    },
);

export const createReplyAction = createAsyncThunk<
    { annotationId: string; reply: Reply },
    { annotationId: string; message: string },
    AppThunkAPI
>(
    'CREATE_REPLY',
    async ({ annotationId, message }, { extra, getState, signal }) => {
        const client = extra.api.getAnnotationsAPI();
        const state = getState();
        const fileId = getFileId(state);
        const filePermissions = getPermissions(state);
        const annotation = getAnnotation(state, annotationId);
        const permissions = { ...filePermissions, ...annotation?.permissions };

        signal.addEventListener('abort', () => {
            client.destroy();
        });

        const reply = await new Promise<Reply>((resolve, reject) => {
            client.createAnnotationReply(fileId, annotationId, permissions, message, resolve, reject);
        });

        return { annotationId, reply };
    },
);

export const deleteAnnotationAction = createAsyncThunk<string, string, AppThunkAPI>(
    'DELETE_ANNOTATION',
    async (annotationId, { extra, getState, signal }) => {
        const client = extra.api.getAnnotationsAPI();
        const state = getState();
        const fileId = getFileId(state);
        const filePermissions = getPermissions(state);
        const annotation = getAnnotation(state, annotationId);
        const permissions = { ...filePermissions, ...annotation?.permissions };

        signal.addEventListener('abort', () => {
            client.destroy();
        });

        await new Promise<void>((resolve, reject) => {
            client.deleteAnnotation(fileId, annotationId, permissions, resolve, reject);
        });

        return annotationId;
    },
);

export const updateAnnotationAction = createAsyncThunk<
    Annotation,
    { annotationId: string; payload: { message?: string; status?: string } },
    AppThunkAPI
>(
    'UPDATE_ANNOTATION',
    async ({ annotationId, payload }, { extra, getState, signal }) => {
        const client = extra.api.getAnnotationsAPI();
        const state = getState();
        const fileId = getFileId(state);
        const filePermissions = getPermissions(state);
        const existingAnnotation = getAnnotation(state, annotationId);
        const permissions = { ...filePermissions, ...existingAnnotation?.permissions };

        signal.addEventListener('abort', () => {
            client.destroy();
        });

        return new Promise<Annotation>((resolve, reject) => {
            client.updateAnnotation(fileId, annotationId, permissions, payload, resolve, reject);
        });
    },
);

export const updateReplyAction = createAsyncThunk<
    { annotationId: string; reply: Reply },
    { annotationId: string; replyId: string; payload: { message?: string; status?: string } },
    AppThunkAPI
>(
    'UPDATE_REPLY',
    async ({ annotationId, replyId, payload }, { extra, getState, signal }) => {
        const client = extra.api.getThreadedCommentsAPI();
        const state = getState();
        const fileId = getFileId(state);
        const annotation = getAnnotation(state, annotationId);
        const reply = annotation?.replies?.find(r => r.id === replyId);

        if (!reply) {
            throw new Error(`updateReplyAction: reply ${replyId} not found on annotation ${annotationId}`);
        }

        signal.addEventListener('abort', () => {
            client.destroy();
        });

        const updated = await new Promise<Reply>((resolve, reject) => {
            client.updateComment({
                commentId: replyId,
                errorCallback: reject,
                fileId,
                message: payload.message,
                permissions: reply.permissions ?? {},
                status: payload.status,
                successCallback: resolve,
            });
        });

        return { annotationId, reply: updated };
    },
);

export const deleteReplyAction = createAsyncThunk<
    { annotationId: string; replyId: string },
    { annotationId: string; replyId: string },
    AppThunkAPI
>(
    'DELETE_REPLY',
    async ({ annotationId, replyId }, { extra, getState, signal }) => {
        const client = extra.api.getThreadedCommentsAPI();
        const state = getState();
        const fileId = getFileId(state);
        const annotation = getAnnotation(state, annotationId);
        const reply = annotation?.replies?.find(r => r.id === replyId);

        if (!reply) {
            throw new Error(`deleteReplyAction: reply ${replyId} not found on annotation ${annotationId}`);
        }

        signal.addEventListener('abort', () => {
            client.destroy();
        });

        await new Promise<void>((resolve, reject) => {
            client.deleteComment({
                commentId: replyId,
                errorCallback: reject,
                fileId,
                permissions: reply.permissions ?? {},
                successCallback: resolve,
            });
        });

        return { annotationId, replyId };
    },
);

export type SidebarAnnotationUpdatePayload = Partial<Annotation> & { id: string };
export type SidebarReplyMutationPayload = { annotationId: string; reply: Reply };
export type SidebarReplyDeletePayload = { annotationId: string; replyId: string };

export const applySidebarAnnotationUpdateAction = createAction<SidebarAnnotationUpdatePayload>(
    'APPLY_SIDEBAR_ANNOTATION_UPDATE',
);
export const applySidebarReplyCreateAction = createAction<SidebarReplyMutationPayload>(
    'APPLY_SIDEBAR_REPLY_CREATE',
);
export const applySidebarReplyDeleteAction = createAction<SidebarReplyDeletePayload>(
    'APPLY_SIDEBAR_REPLY_DELETE',
);
export const applySidebarReplyUpdateAction = createAction<SidebarReplyMutationPayload>(
    'APPLY_SIDEBAR_REPLY_UPDATE',
);

export const removeAnnotationAction = createAction<string>('REMOVE_ANNOTATION');
export const setActiveAnnotationIdAction = createAction<string | null>('SET_ACTIVE_ANNOTATION_ID');
export const setIsInitialized = createAction('SET_IS_INITIALIZED');
