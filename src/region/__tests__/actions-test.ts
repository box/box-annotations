import { Rect } from '../../@types';
import { createRegionAction } from '../actions';

describe('region/actions', () => {
    describe('createRegionAction', () => {
        test('should return a promise that proxies createAnnotationAction', async () => {
            const arg = {
                location: 5,
                message: 'message',
                shape: {
                    x: 10,
                    y: 10,
                } as Rect,
            };
            const dispatch = jest.fn();
            const getState = jest.fn();
            const result = await createRegionAction(arg)(dispatch, getState, {});

            expect(dispatch).toHaveBeenCalledTimes(3); // pending, saveAnnotations, fulfilled
            expect(result.meta.arg).toEqual(arg);
        });
    });
});
