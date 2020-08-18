import { createSelectionAction, setSelectionAction } from '../actions';
import { mockRange } from '../__mocks__/range';

describe('store/selection/actions', () => {
    describe('createSelectionAction', () => {
        const arg = {
            location: 1,
            range: mockRange,
        };

        test('should construct selection state', () => {
            expect(createSelectionAction(arg)).toEqual(
                setSelectionAction({
                    boundingRect: {
                        height: 100,
                        width: 100,
                        x: 200,
                        y: 200,
                    },
                    location: 1,
                    rects: [
                        {
                            height: 100,
                            width: 100,
                            x: 200,
                            y: 200,
                        },
                    ],
                }),
            );
        });
    });
});
