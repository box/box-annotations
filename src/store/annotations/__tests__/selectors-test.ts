import annotationsState from '../__mocks__/annotationsState';
import { getAnnotation, getAnnotations, getAnnotationsForLocation } from '../selectors';

describe('store/annotations/selectors', () => {
    const state = { annotations: annotationsState };

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
    });
});
