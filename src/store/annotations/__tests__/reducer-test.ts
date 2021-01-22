import reducer from '../reducer';
import state from '../__mocks__/annotationsState';
import { Annotation, AnnotationDrawing, NewAnnotation, PathGroup } from '../../../@types';
import { APICollection } from '../../../api';
import {
    createAnnotationAction,
    fetchAnnotationsAction,
    removeAnnotationAction,
    setActiveAnnotationIdAction,
    setIsInitialized,
} from '../actions';

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
});
