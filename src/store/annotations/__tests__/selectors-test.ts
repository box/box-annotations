import {annotationState,  videoAnnotationState } from '../__mocks__/annotationsState';
import {
    getActiveAnnotationId,
    getAnnotation,
    getAnnotations,
    getAnnotationsForLocation,
    getIsInitialized,
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

    describe('getIsInitialized', () => {
        test('should return isInitialized status', () => {
            expect(getIsInitialized(state)).toBe(false);
        });
    });
});
