import { NewAnnotation } from '../../../@types';
import { createAnnotationAction } from '../actions';

describe('store/annotations/actions', () => {
    describe('createAnnotationAction', () => {
        test('should return a promise that resolves with an annotation', async () => {
            const arg = { target: { shape: { x: 10, y: 10 } } } as NewAnnotation;
            const dispatch = jest.fn();
            const getState = jest.fn();
            const result = await createAnnotationAction(arg)(dispatch, getState, {});

            expect(result.payload).toMatchObject({
                id: expect.any(String),
                target: expect.any(Object),
                type: 'annotation',
            });
        });
    });
});
