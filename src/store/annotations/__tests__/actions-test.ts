import API from '../../../api';
import {
    createAnnotationAction,
    createReplyAction,
    deleteReplyAction,
    fetchAnnotationRepliesAction,
    fetchAnnotationsAction,
    updateAnnotationAction,
    updateReplyAction,
} from '../actions';
import { annotationReplies } from '../../../api/__mocks__/APIFactory';
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
    const richTextOptions = {
        ...baseState.options,
        features: { isRichTextEnabled: true, isThreadedAnnotation: true },
    };

    describe('createAnnotationAction', () => {
        const arg = { target: { shape: { x: 10, y: 10 } } } as NewAnnotation;

        afterEach(() => {
            getState.mockReturnValue(baseState);
        });

        test('should pass isRichTextEnabled into createAnnotation', async () => {
            const createAnnotation = jest.fn((fileId, fileVersionId, payload, permissions, resolve) =>
                resolve({ id: 'anno_1' }),
            );
            (api.getAnnotationsAPI as jest.Mock).mockReturnValueOnce({ createAnnotation, destroy: jest.fn() });
            getState.mockReturnValue({ ...baseState, options: richTextOptions });

            await createAnnotationAction(arg)(dispatch, getState, { api });

            expect(createAnnotation).toHaveBeenCalledWith(
                '12345',
                '67890',
                arg,
                baseState.options.permissions,
                expect.any(Function),
                expect.any(Function),
                true,
            );
        });

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

        describe('rich text', () => {
            afterEach(() => {
                getState.mockReturnValue(baseState);
            });

            test.each`
                isThreadedAnnotation | isRichTextEnabled | expected
                ${true}              | ${true}           | ${true}
                ${false}             | ${true}           | ${false}
                ${true}              | ${false}          | ${false}
            `(
                'should pass $expected into getAnnotations when isThreadedAnnotation is $isThreadedAnnotation and isRichTextEnabled is $isRichTextEnabled',
                async ({ isThreadedAnnotation, isRichTextEnabled, expected }) => {
                    const getAnnotations = jest.fn((fileId, fileVersionId, permissions, resolve) =>
                        resolve({ entries: [], limit: 1000, next_marker: null }),
                    );
                    (api.getAnnotationsAPI as jest.Mock).mockReturnValueOnce({
                        getAnnotations,
                        destroy: jest.fn(),
                    });
                    getState.mockReturnValue({
                        ...baseState,
                        options: {
                            ...baseState.options,
                            features: { isRichTextEnabled, isThreadedAnnotation },
                        },
                    });

                    await fetchAnnotationsAction()(dispatch, getState, { api });

                    expect(getAnnotations).toHaveBeenCalledWith(
                        '12345',
                        '67890',
                        baseState.options.permissions,
                        expect.any(Function),
                        expect.any(Function),
                        1000,
                        false,
                        isThreadedAnnotation,
                        expected,
                    );
                },
            );
        });
    });

    describe('createReplyAction', () => {
        afterEach(() => {
            getState.mockReturnValue(baseState);
        });

        test('should pass isRichTextEnabled into createAnnotationReply', async () => {
            const createAnnotationReply = jest.fn((fileId, annotationId, permissions, message, resolve) =>
                resolve({ id: 'reply_1', message }),
            );
            (api.getAnnotationsAPI as jest.Mock).mockReturnValueOnce({ createAnnotationReply, destroy: jest.fn() });
            getState.mockReturnValue({ ...baseState, options: richTextOptions });

            await createReplyAction({ annotationId: 'anno_1', message: 'hello' })(dispatch, getState, { api });

            expect(createAnnotationReply).toHaveBeenCalledWith(
                '12345',
                'anno_1',
                baseState.options.permissions,
                'hello',
                expect.any(Function),
                expect.any(Function),
                true,
            );
        });
    });

    describe('updateAnnotationAction', () => {
        afterEach(() => {
            getState.mockReturnValue(baseState);
        });

        test('should pass isRichTextEnabled into updateAnnotation', async () => {
            const payload = { message: 'updated' };
            const updateAnnotation = jest.fn((fileId, annotationId, permissions, data, resolve) =>
                resolve({ id: annotationId }),
            );
            (api.getAnnotationsAPI as jest.Mock).mockReturnValueOnce({ updateAnnotation, destroy: jest.fn() });
            getState.mockReturnValue({ ...baseState, options: richTextOptions });

            await updateAnnotationAction({ annotationId: 'anno_1', payload })(dispatch, getState, { api });

            expect(updateAnnotation).toHaveBeenCalledWith(
                '12345',
                'anno_1',
                baseState.options.permissions,
                payload,
                expect.any(Function),
                expect.any(Function),
                true,
            );
        });
    });

    describe('fetchAnnotationRepliesAction', () => {
        const annotationId = 'anno_1';
        const annotation = { id: annotationId, permissions: { can_view_annotations: true } } as unknown as Annotation;

        beforeEach(() => {
            getState.mockReturnValue({
                ...baseState,
                annotations: { ...baseState.annotations, byId: { [annotationId]: annotation } },
            });
        });

        afterEach(() => {
            getState.mockReturnValue(baseState);
        });

        test('should resolve with annotationId and the replies list from the API', async () => {
            const result = await fetchAnnotationRepliesAction(annotationId)(dispatch, getState, { api });

            expect(result.payload).toEqual({ annotationId, replies: annotationReplies });
        });

        test('should abort the request if the action abort method is called', async () => {
            const action = fetchAnnotationRepliesAction(annotationId)(dispatch, getState, { api });

            action.abort();

            const result = await action;

            expect(result.meta).toMatchObject({ aborted: true });
            expect(result.payload).toBe(undefined);
        });

        test('should dispatch a rejected action carrying the API error when getAnnotationReplies fails', async () => {
            const apiError = { message: 'boom', status: 500 };
            const getAnnotationReplies = jest.fn((fileId, id, permissions, resolve, reject) => reject(apiError));
            (api.getAnnotationsAPI as jest.Mock).mockReturnValueOnce({
                getAnnotationReplies,
                destroy: jest.fn(),
            });

            const result = await fetchAnnotationRepliesAction(annotationId)(dispatch, getState, { api });

            expect(result.type).toBe('FETCH_ANNOTATION_REPLIES/rejected');
            expect(result.payload).toBeUndefined();
            expect((result as { error: { message: string } }).error.message).toBe('boom');
        });

        test.each([
            ['no result object', undefined],
            ['null result', null],
            ['result missing entries', {}],
            ['non-array entries', { entries: null }],
        ])(
            'should reject instead of returning success when the success callback fires with %s',
            async (_label, malformed) => {
                const getAnnotationReplies = jest.fn((fileId, id, permissions, resolve) => resolve(malformed));
                (api.getAnnotationsAPI as jest.Mock).mockReturnValueOnce({
                    getAnnotationReplies,
                    destroy: jest.fn(),
                });

                const result = await fetchAnnotationRepliesAction(annotationId)(dispatch, getState, { api });

                expect(result.type).toBe('FETCH_ANNOTATION_REPLIES/rejected');
                expect(result.payload).toBeUndefined();
                expect((result as { error: { message: string } }).error.message).toContain('malformed payload');
            },
        );
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

        test('should pass isRichTextEnabled into updateComment', async () => {
            const updateComment = jest.fn(({ successCallback }) =>
                successCallback({ id: replyId, message: 'updated' }),
            );
            (api.getThreadedCommentsAPI as jest.Mock).mockReturnValueOnce({ updateComment, destroy: jest.fn() });
            getState.mockReturnValue({
                ...baseState,
                annotations: { ...baseState.annotations, byId: { [annotationId]: annotation } },
                options: richTextOptions,
            });

            await updateReplyAction(arg)(dispatch, getState, { api });

            expect(updateComment).toHaveBeenCalledWith(expect.objectContaining({ shouldEnableRichText: true }));
        });

        test('should reject with a clear error when the reply is not in state', async () => {
            getState.mockReturnValue(baseState);

            const result = await updateReplyAction(arg)(dispatch, getState, { api });

            expect(result.type).toBe('UPDATE_REPLY/rejected');
            expect(result.payload).toBeUndefined();
            const { error } = result as { error: { message: string } };
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
            const { error } = result as { error: { message: string } };
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
