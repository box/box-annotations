import { Rect } from '../../@types';
import { createRegionAction } from '../actions';
import { createAnnotationAction } from '../../store/annotations';

jest.mock('../../store/annotations');

describe('region/actions', () => {
    describe('createRegionAction', () => {
        const arg = {
            location: 5,
            message: 'message',
            shape: {
                height: 100.25,
                width: 100.25,
                x: 10.75,
                y: 10.75,
            } as Rect,
        };
        const dispatch = jest.fn();
        const getState = jest.fn();

        test('should return a promise that proxies the async createAnnotationAction', async () => {
            const result = await createRegionAction(arg)(dispatch, getState, {});

            expect(dispatch).toHaveBeenCalledTimes(3); // pending, createAnnotation, fulfilled
            expect(result.meta.arg).toEqual(arg);
        });

        test('should round the argument target position and size to the nearest whole integer', async () => {
            await createRegionAction(arg)(dispatch, getState, {});

            expect(createAnnotationAction).toHaveBeenCalledWith({
                description: {
                    message: 'message',
                    type: 'reply',
                },
                target: {
                    location: {
                        type: 'page',
                        value: 5,
                    },
                    shape: {
                        height: 100,
                        width: 100,
                        x: 11,
                        y: 11,
                    },
                    type: 'region',
                },
            });
        });
    });
});
