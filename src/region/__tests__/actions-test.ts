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

        test('should format its argument and dispatch', async () => {
            await createRegionAction(arg)(dispatch);

            expect(dispatch).toHaveBeenCalled();
        });

        test('should round the argument target position and size to the nearest whole integer', async () => {
            await createRegionAction(arg)(dispatch);

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
