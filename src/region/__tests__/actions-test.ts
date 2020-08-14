import { Rect } from '../../@types';
import { createAnnotationAction } from '../../store/annotations';
import { createRegionAction } from '../actions';

jest.mock('../../store/annotations');
jest.mock('../../store/options', () => ({
    getFileVersionId: jest.fn().mockReturnValue('123'),
}));

describe('region/actions', () => {
    describe('createRegionAction', () => {
        const arg = {
            message: 'message',
            target: {
                location: {
                    type: 'page' as const,
                    value: 5,
                },
                shape: {
                    height: 50.25,
                    width: 50.25,
                    x: 10.75,
                    y: 10.75,
                } as Rect,
                type: 'region' as const,
            },
        };
        const dispatch = jest.fn();
        const getState = jest.fn();

        test('should format its argument and dispatch', async () => {
            await createRegionAction(arg)(dispatch, getState);

            expect(dispatch).toHaveBeenCalled();
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
                    shape: arg.target.shape,
                    type: 'region',
                },
            });
        });
    });
});
