import { annotationState, videoAnnotationState } from '../__mocks__/annotationsState';
import {
    getActiveAnnotationId,
    getAnnotation,
    getAnnotations,
    getAnnotationsForLocation,
    getIsInitialized,
    getVisibleActiveAnnotationId,
} from '../selectors';

describe('store/annotations/selectors', () => {
    const state = { annotations: annotationState };
    const videoState = { annotations: videoAnnotationState };

    describe('getAnnotation', () => {
        test('should return an annotation by the specified id', () => {
            expect(getAnnotation(state, 'test1')).toMatchObject({ id: 'test1' });
        });

        test('should return undefined if the specified id is not available', () => {
            expect(getAnnotation(state, 'nonsense')).toStrictEqual(undefined);
        });
    });

    describe('getAnnotations', () => {
        test('should return all annotations', () => {
            expect(getAnnotations(state).length).toBe(3);
        });
    });

    describe('getAnnotationsForLocation', () => {
        test('should return all annotations for a given location', () => {
            expect(getAnnotationsForLocation(state, 1)).toEqual([
                expect.objectContaining({ id: 'test1' }),
                expect.objectContaining({ id: 'test2' }),
            ]);
        });

        test('should return all annotations for video content', () => {
            expect(getAnnotationsForLocation(videoState, -1)).toEqual([
                expect.objectContaining({ id: 'testVid1' }),
                expect.objectContaining({ id: 'testVid2' }),
                expect.objectContaining({ id: 'testVid3' }),
            ]);
        });

        test('should omit resolved annotations when showResolved is false', () => {
            const hiddenState = {
                annotations: {
                    ...annotationState,
                    byId: {
                        ...annotationState.byId,
                        test1: { ...annotationState.byId.test1, status: 'resolved' as const },
                    },
                },
                options: { showResolved: false },
            };

            expect(getAnnotationsForLocation(hiddenState, 1)).toEqual([expect.objectContaining({ id: 'test2' })]);
        });

        test('should keep resolved annotations when showResolved is true', () => {
            const visibleState = {
                annotations: {
                    ...annotationState,
                    byId: {
                        ...annotationState.byId,
                        test1: { ...annotationState.byId.test1, status: 'resolved' as const },
                    },
                },
                options: { showResolved: true },
            };

            expect(getAnnotationsForLocation(visibleState, 1)).toEqual([
                expect.objectContaining({ id: 'test1' }),
                expect.objectContaining({ id: 'test2' }),
            ]);
        });
    });

    describe('getActiveAnnotationId', () => {
        test('should get the null active id', () => {
            expect(getActiveAnnotationId(state)).toEqual(null);
        });

        test('should get the active id', () => {
            const newState = { annotations: { ...annotationState, activeId: '123' } };
            expect(getActiveAnnotationId(newState)).toEqual('123');
        });
    });

    describe('getVisibleActiveAnnotationId', () => {
        test('should return the active id when the annotation is open', () => {
            const openState = {
                annotations: { ...annotationState, activeId: 'test1' },
                options: { showResolved: false },
            };

            expect(getVisibleActiveAnnotationId(openState)).toEqual('test1');
        });

        test('should hide the active id when that annotation is resolved and showResolved is false', () => {
            const hiddenState = {
                annotations: {
                    ...annotationState,
                    activeId: 'test1',
                    byId: {
                        ...annotationState.byId,
                        test1: { ...annotationState.byId.test1, status: 'resolved' as const },
                    },
                },
                options: { showResolved: false },
            };

            expect(getVisibleActiveAnnotationId(hiddenState)).toEqual(null);
        });

        test('should keep a resolved active id when showResolved is unset', () => {
            const visibleState = {
                annotations: {
                    ...annotationState,
                    activeId: 'test1',
                    byId: {
                        ...annotationState.byId,
                        test1: { ...annotationState.byId.test1, status: 'resolved' as const },
                    },
                },
            };

            expect(getVisibleActiveAnnotationId(visibleState)).toEqual('test1');
        });
    });

    describe('getIsInitialized', () => {
        test('should return isInitialized status', () => {
            expect(getIsInitialized(state)).toBe(false);
        });
    });
});
