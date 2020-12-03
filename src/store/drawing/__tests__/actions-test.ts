import { annotations } from '../../../drawing/__mocks__/drawingData';
import { addDrawingPathGroupAction } from '../actions';

const {
    target: { path_groups: pathGroups },
} = annotations[0];

describe('store/drawing/actions', () => {
    describe('addDrawingPathGroupAction()', () => {
        test('should apply client ids to the provided pathGroup', () => {
            expect(addDrawingPathGroupAction(pathGroups[0])).toMatchObject({
                type: 'ADD_DRAWING_PATH_GROUP',
                payload: {
                    clientId: expect.any(String),
                    paths: [
                        {
                            clientId: expect.any(String),
                        },
                    ],
                },
            });
        });
    });
});
