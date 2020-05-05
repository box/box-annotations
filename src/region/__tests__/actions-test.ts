import { Rect } from '../../@types';
import { createRegionAction } from '../actions';
import { createAnnotationAction } from '../../store/annotations';

jest.mock('../../store/annotations');
jest.mock('../../store/options', () => ({
    getFileVersionId: jest.fn().mockReturnValue('123'),
}));

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

        test('should format its argument and dispatch', async () => {
            await createRegionAction(arg)(dispatch, getState);

            expect(dispatch).toHaveBeenCalled();
            expect(getState).toHaveBeenCalled();
        });

        test('should round the argument target position and size to the nearest whole integer', async () => {
            await createRegionAction(arg)(dispatch, getState);

            expect(getState).toHaveBeenCalled();

            expect(createAnnotationAction).toHaveBeenCalledWith({
                description: {
                    message: 'message',
                    type: 'reply',
                },
                file_version: {
                    id: '123',
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
