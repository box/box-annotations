import API from '../../../api';
import {
    createAnnotationAction,
    deleteReplyAction,
    fetchAnnotationsAction,
    updateReplyAction,
} from '../actions';
import { Annotation, NewAnnotation, Reply } from '../../../@types';

jest.mock('../../../api/APIFactory');

describe('store/annotations/actions', () => {
    const api = new API({ token: 'token_1234' });
    const dispatch = jest.fn();
    const baseState = {
        annotations: {
            byId: {} as Record<string, Annotation>,
        },
        options: {
            fileId: '12345',
            fileVersionId: '67890',
            permissions: {
                can_create_annotations: true,
                can_view_annotations: true,
            },
        },
    };
    const getState = jest.fn().mockReturnValue(baseState);

    describe('createAnnotationAction', () => {
        const arg = { target: { shape: { x: 10, y: 10 } } } as NewAnnotation;

        test('should return a promise that resolves with an annotation', async () => {
            const result = await createAnnotationAction(arg)(dispatch, getState, { api });

            expect(result.payload).toMatchObject({
                id: expect.any(String),
                target: expect.any(Object),
                type: 'annotation',
            });
        });

        test('should abort the request if the action abort method is called', async () => {
            const action = createAnnotationAction(arg)(dispatch, getState, { api });

            action.abort();

            const result = await action;

            expect(result.meta).toMatchObject({ aborted: true });
            expect(result.payload).toBe(undefined);
        });
    });

    describe('fetchAnnotationAction', () => {
        test('should return a promise that resolves with a collection of annotations', async () => {
            const result = await fetchAnnotationsAction()(dispatch, getState, { api });

            expect(result.payload).toMatchObject({
                entries: expect.any(Array),
                limit: expect.any(Number),
            });
        });

        test('should abort the request if the action abort method is called', async () => {
            const action = fetchAnnotationsAction()(dispatch, getState, { api });

            action.abort();

            const result = await action;

            expect(result.meta).toMatchObject({ aborted: true });
            expect(result.payload).toBe(undefined);
        });
    });

    describe('updateReplyAction', () => {
        const annotationId = 'anno_1';
        const replyId = 'reply_1';
        const arg = { annotationId, replyId, payload: { message: 'updated' } };
        const reply = { id: replyId, message: 'old', permissions: { can_edit: true } } as unknown as Reply;
        const annotation = { id: annotationId, replies: [reply] } as unknown as Annotation;

        beforeEach(() => {
            getState.mockReturnValue({
                ...baseState,
                annotations: { ...baseState.annotations, byId: { [annotationId]: annotation } },
            });
        });

        afterEach(() => {
            getState.mockReturnValue(baseState);
        });

        test('should resolve with annotationId and updated reply from threaded comments API', async () => {
            const result = await updateReplyAction(arg)(dispatch, getState, { api });

            expect(result.payload).toEqual({ annotationId, reply: { id: 'reply_1', message: 'updated' } });
        });

        test('should reject with a clear error when the reply is not in state', async () => {
            getState.mockReturnValue(baseState);

            const result = await updateReplyAction(arg)(dispatch, getState, { api });

            expect(result.type).toBe('UPDATE_REPLY/rejected');
            expect(result.payload).toBeUndefined();
            const {error} = (result as { error: { message: string } });
            expect(error.message).toContain('reply reply_1 not found');
        });

        test('should abort the request if the action abort method is called', async () => {
            const action = updateReplyAction(arg)(dispatch, getState, { api });

            action.abort();

            const result = await action;

            expect(result.meta).toMatchObject({ aborted: true });
            expect(result.payload).toBe(undefined);
        });
    });

    describe('deleteReplyAction', () => {
        const annotationId = 'anno_1';
        const replyId = 'reply_1';
        const arg = { annotationId, replyId };
        const reply = { id: replyId, permissions: { can_delete: true } } as unknown as Reply;
        const annotation = { id: annotationId, replies: [reply] } as unknown as Annotation;

        beforeEach(() => {
            getState.mockReturnValue({
                ...baseState,
                annotations: { ...baseState.annotations, byId: { [annotationId]: annotation } },
            });
        });

        afterEach(() => {
            getState.mockReturnValue(baseState);
        });

        test('should resolve with the annotationId and replyId via threaded comments API', async () => {
            const result = await deleteReplyAction(arg)(dispatch, getState, { api });

            expect(result.payload).toEqual({ annotationId, replyId });
        });

        test('should reject with a clear error when the reply is not in state', async () => {
            getState.mockReturnValue(baseState);

            const result = await deleteReplyAction(arg)(dispatch, getState, { api });

            expect(result.type).toBe('DELETE_REPLY/rejected');
            expect(result.payload).toBeUndefined();
            const {error} = (result as { error: { message: string } });
            expect(error.message).toContain('reply reply_1 not found');
        });

        test('should abort the request if the action abort method is called', async () => {
            const action = deleteReplyAction(arg)(dispatch, getState, { api });

            action.abort();

            const result = await action;

            expect(result.meta).toMatchObject({ aborted: true });
            expect(result.payload).toBe(undefined);
        });
    });
});
