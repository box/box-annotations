import reducer from '../reducer';
import {annotationState as state} from '../__mocks__/annotationsState';
import { Annotation, AnnotationDrawing, NewAnnotation, PathGroup, Reply } from '../../../@types';
import { APICollection } from '../../../api';
import {
    createAnnotationAction,
    createReplyAction,
    deleteAnnotationAction,
    deleteReplyAction,
    fetchAnnotationsAction,
    removeAnnotationAction,
    setActiveAnnotationIdAction,
    setIsInitialized,
    updateAnnotationAction,
    updateReplyAction,
} from '../actions';
import { setViewModeAction } from '../../options/actions';

describe('store/annotations/reducer', () => {
    const getAnnotation = (): AnnotationDrawing => {
        return {
            id: 'anno_1',
            target: {
                path_groups: [{ paths: [{ points: [] }], stroke: { color: '#000', size: 1 } }] as Array<PathGroup>,
                type: 'drawing',
            },
            type: 'annotation',
        } as AnnotationDrawing;
    };

    describe('setIsInitialized', () => {
        test('should set isInitialized', () => {
            const newState = reducer(state, setIsInitialized());

            expect(newState.isInitialized).toEqual(true);
        });
    });

    describe('createAnnotationAction', () => {
        test('should set state when fulfilled', () => {
            const arg = {} as NewAnnotation;
            const payload = { id: 'anno_1', type: 'annotation' } as Annotation;
            const newState = reducer(state, createAnnotationAction.fulfilled(payload, 'test', arg));

            expect(newState.allIds).toContain(payload.id);
            expect(newState.byId.anno_1).toEqual(payload);
        });

        test('should set format drawing if drawing type annotation', () => {
            const arg = {} as NewAnnotation;
            const payload = getAnnotation();
            const newState = reducer(state, createAnnotationAction.fulfilled(payload, 'test', arg));

            expect(newState.allIds).toContain(payload.id);
            expect(newState.byId.anno_1).toMatchObject({
                target: {
                    path_groups: [
                        {
                            clientId: expect.any(String),
                            paths: [{ clientId: expect.any(String) }],
                        },
                    ],
                },
            });
        });
    });

    describe('fetchAnnotationsAction', () => {
        test('should set state when fulfilled', () => {
            const annotation = { id: 'anno_1', target: { type: 'region' }, type: 'annotation' };
            const payload = { entries: [annotation], limit: 1000, next_marker: null } as APICollection<Annotation>;
            const newState = reducer(state, fetchAnnotationsAction.fulfilled(payload, 'test', undefined));

            expect(newState.activeId).toEqual(null);
            expect(newState.allIds).toContain(payload.entries[0].id);
            expect(newState.byId.anno_1).toEqual(payload.entries[0]);
        });

        test('should format drawing when target is drawing type', () => {
            const annotation = getAnnotation();
            const payload = { entries: [annotation], limit: 1000, next_marker: null } as APICollection<Annotation>;
            const newState = reducer(state, fetchAnnotationsAction.fulfilled(payload, 'test', undefined));

            expect(newState.byId.anno_1).toMatchObject({
                target: {
                    path_groups: [
                        {
                            clientId: expect.any(String),
                            paths: [{ clientId: expect.any(String) }],
                        },
                    ],
                },
            });
        });
    });

    describe('setActiveAnnotationIdAction', () => {
        test.each(['123', null])('should set activeId state appropriately with %s', annotationId => {
            const payload = annotationId;
            const newState = reducer(state, setActiveAnnotationIdAction(payload));

            expect(newState.activeId).toBe(payload);
        });
    });

    describe('removeAnnotationAction', () => {
        test('should remove an annotation from the store', () => {
            const payload = 'test1';
            const newState = reducer(state, removeAnnotationAction(payload));

            expect(newState.allIds).not.toContain(payload);
            expect(newState.byId.test1).toBe(undefined);
        });

        test('should set activeId to null if deleted annotation is active', () => {
            const payload = 'test1';
            state.activeId = 'test1';

            const newState = reducer(state, removeAnnotationAction(payload));

            expect(newState.activeId).toBe(null);
        });
    });

    describe('createReplyAction', () => {
        test('should append reply to annotation replies', () => {
            const annotationId = 'test1';
            const reply = {
                created_at: '2026-01-01T00:00:00Z',
                created_by: { id: '1', login: 'user@box.com', name: 'User', type: 'user' },
                id: 'reply-1',
                message: 'A reply',
                parent: { id: annotationId, type: 'annotation' },
                type: 'reply',
            } as Reply;

            const stateWithAnnotation = {
                ...state,
                byId: {
                    ...state.byId,
                    test1: { ...state.byId.test1, replies: [] } as unknown as Annotation,
                },
            };

            const newState = reducer(
                stateWithAnnotation,
                createReplyAction.fulfilled({ annotationId, reply }, 'test', { annotationId, message: 'A reply' }),
            );

            expect(newState.byId.test1.replies).toHaveLength(1);
            expect(newState.byId.test1.replies![0]).toEqual(reply);
        });

        test('should create replies array if annotation has no replies', () => {
            const annotationId = 'test1';
            const reply = {
                created_at: '2026-01-01T00:00:00Z',
                created_by: { id: '1', login: 'user@box.com', name: 'User', type: 'user' },
                id: 'reply-1',
                message: 'A reply',
                parent: { id: annotationId, type: 'annotation' },
                type: 'reply',
            } as Reply;

            const newState = reducer(
                state,
                createReplyAction.fulfilled({ annotationId, reply }, 'test', { annotationId, message: 'A reply' }),
            );

            expect(newState.byId.test1.replies).toHaveLength(1);
        });

        test('should not modify state if annotation does not exist', () => {
            const reply = { id: 'reply-1', message: 'A reply' } as Reply;

            const newState = reducer(
                state,
                createReplyAction.fulfilled(
                    { annotationId: 'nonexistent', reply },
                    'test',
                    { annotationId: 'nonexistent', message: 'A reply' },
                ),
            );

            expect(newState.byId).toEqual(state.byId);
        });
    });

    describe('deleteAnnotationAction', () => {
        test('should remove annotation from byId and allIds', () => {
            const newState = reducer(state, deleteAnnotationAction.fulfilled('test1', 'test', 'test1'));

            expect(newState.allIds).not.toContain('test1');
            expect(newState.byId.test1).toBeUndefined();
        });

        test('should clear activeId when deleted annotation is active', () => {
            const stateWithActive = { ...state, activeId: 'test1' };
            const newState = reducer(stateWithActive, deleteAnnotationAction.fulfilled('test1', 'test', 'test1'));

            expect(newState.activeId).toBeNull();
        });

        test('should not clear activeId when deleted annotation is not active', () => {
            const stateWithActive = { ...state, activeId: 'test2' };
            const newState = reducer(stateWithActive, deleteAnnotationAction.fulfilled('test1', 'test', 'test1'));

            expect(newState.activeId).toBe('test2');
        });
    });

    describe('updateAnnotationAction', () => {
        test('should update annotation in byId', () => {
            const updated = { id: 'test1', target: { type: 'region' }, type: 'annotation', status: 'resolved' } as unknown as Annotation;
            const newState = reducer(
                state,
                updateAnnotationAction.fulfilled(updated, 'test', { annotationId: 'test1', payload: { status: 'resolved' } }),
            );

            expect(newState.byId.test1).toEqual(updated);
        });
    });

    describe('updateReplyAction', () => {
        const existingReply = {
            created_at: '2026-01-01T00:00:00Z',
            created_by: { id: '1', login: 'user@box.com', name: 'User', type: 'user' },
            id: 'reply-1',
            message: 'old message',
            parent: { id: 'test1', type: 'annotation' },
            type: 'reply',
        } as Reply;

        test('should replace the matching reply in the annotation replies list', () => {
            const updatedReply = { ...existingReply, message: 'new message' } as Reply;
            const stateWithReply = {
                ...state,
                byId: {
                    ...state.byId,
                    test1: { ...state.byId.test1, replies: [existingReply] } as unknown as Annotation,
                },
            };

            const newState = reducer(
                stateWithReply,
                updateReplyAction.fulfilled(
                    { annotationId: 'test1', reply: updatedReply },
                    'test',
                    { annotationId: 'test1', replyId: 'reply-1', payload: { message: 'new message' } },
                ),
            );

            expect(newState.byId.test1.replies).toHaveLength(1);
            expect(newState.byId.test1.replies![0]).toEqual(updatedReply);
        });

        test('should leave other replies untouched when one reply is updated', () => {
            const otherReply = { ...existingReply, id: 'reply-2', message: 'other' } as Reply;
            const updatedReply = { ...existingReply, message: 'new message' } as Reply;
            const stateWithReplies = {
                ...state,
                byId: {
                    ...state.byId,
                    test1: { ...state.byId.test1, replies: [existingReply, otherReply] } as unknown as Annotation,
                },
            };

            const newState = reducer(
                stateWithReplies,
                updateReplyAction.fulfilled(
                    { annotationId: 'test1', reply: updatedReply },
                    'test',
                    { annotationId: 'test1', replyId: 'reply-1', payload: { message: 'new message' } },
                ),
            );

            expect(newState.byId.test1.replies).toEqual([updatedReply, otherReply]);
        });

        test('should not modify state if annotation does not exist', () => {
            const updatedReply = { ...existingReply, message: 'new message' } as Reply;
            const newState = reducer(
                state,
                updateReplyAction.fulfilled(
                    { annotationId: 'nonexistent', reply: updatedReply },
                    'test',
                    { annotationId: 'nonexistent', replyId: 'reply-1', payload: { message: 'new message' } },
                ),
            );

            expect(newState.byId).toEqual(state.byId);
        });

        test('should not modify state if annotation has no replies', () => {
            const updatedReply = { ...existingReply, message: 'new message' } as Reply;
            const newState = reducer(
                state,
                updateReplyAction.fulfilled(
                    { annotationId: 'test1', reply: updatedReply },
                    'test',
                    { annotationId: 'test1', replyId: 'reply-1', payload: { message: 'new message' } },
                ),
            );

            expect(newState.byId.test1).toEqual(state.byId.test1);
        });
    });

    describe('deleteReplyAction', () => {
        const replyA = {
            created_at: '2026-01-01T00:00:00Z',
            created_by: { id: '1', login: 'user@box.com', name: 'User', type: 'user' },
            id: 'reply-1',
            message: 'first',
            parent: { id: 'test1', type: 'annotation' },
            type: 'reply',
        } as Reply;
        const replyB = { ...replyA, id: 'reply-2', message: 'second' } as Reply;

        test('should remove the targeted reply from the replies list', () => {
            const stateWithReplies = {
                ...state,
                byId: {
                    ...state.byId,
                    test1: { ...state.byId.test1, replies: [replyA, replyB] } as unknown as Annotation,
                },
            };

            const newState = reducer(
                stateWithReplies,
                deleteReplyAction.fulfilled(
                    { annotationId: 'test1', replyId: 'reply-1' },
                    'test',
                    { annotationId: 'test1', replyId: 'reply-1' },
                ),
            );

            expect(newState.byId.test1.replies).toEqual([replyB]);
        });

        test('should leave replies unchanged when replyId is not found', () => {
            const stateWithReplies = {
                ...state,
                byId: {
                    ...state.byId,
                    test1: { ...state.byId.test1, replies: [replyA] } as unknown as Annotation,
                },
            };

            const newState = reducer(
                stateWithReplies,
                deleteReplyAction.fulfilled(
                    { annotationId: 'test1', replyId: 'reply-other' },
                    'test',
                    { annotationId: 'test1', replyId: 'reply-other' },
                ),
            );

            expect(newState.byId.test1.replies).toEqual([replyA]);
        });

        test('should not modify state if annotation does not exist', () => {
            const newState = reducer(
                state,
                deleteReplyAction.fulfilled(
                    { annotationId: 'nonexistent', replyId: 'reply-1' },
                    'test',
                    { annotationId: 'nonexistent', replyId: 'reply-1' },
                ),
            );

            expect(newState.byId).toEqual(state.byId);
        });
    });

    describe('setViewModeAction', () => {
        test('should clear activeId when switching to boundingBoxes mode', () => {
            const stateWithActiveAnnotation = {
                ...state,
                activeId: 'test1',
            };

            const newState = reducer(stateWithActiveAnnotation, setViewModeAction('boundingBoxes'));

            expect(newState.activeId).toBeNull();
        });

        test('should not clear activeId when switching to annotations mode', () => {
            const stateWithActiveAnnotation = {
                ...state,
                activeId: 'test1',
            };

            const newState = reducer(stateWithActiveAnnotation, setViewModeAction('annotations'));

            expect(newState.activeId).toBe('test1');
        });

        test('should handle clearing when activeId is already null', () => {
            const stateWithoutActive = {
                ...state,
                activeId: null,
            };

            const newState = reducer(stateWithoutActive, setViewModeAction('boundingBoxes'));

            expect(newState.activeId).toBeNull();
        });
    });
});
