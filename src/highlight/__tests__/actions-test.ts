import { Rect } from '../../@types';
import { createAnnotationAction } from '../../store/annotations';
import { createHighlightAction } from '../actions';

jest.mock('../../store/annotations');
jest.mock('../../store/options', () => ({
    getFileVersionId: jest.fn().mockReturnValue('123'),
}));

describe('highlight/actions', () => {
    describe('createHighlightAction', () => {
        const arg = {
            location: 5,
            message: 'message',
            shapes: [
                {
                    height: 50.25,
                    width: 50.25,
                    x: 10.75,
                    y: 10.75,
                } as Rect,
            ],
        };
        const dispatch = jest.fn();
        const getState = jest.fn();

        test('should format its argument and dispatch', async () => {
            await createHighlightAction(arg)(dispatch, getState);

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
                    shapes: arg.shapes,
                    type: 'highlight',
                },
            });
        });
    });
});
