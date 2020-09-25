import state from '../__mocks__/creatorState';
import { setReferenceShapeAction } from '../actions';

describe('creator/actions', () => {
    describe('setReferenceShapeAction', () => {
        const arg = {
            height: 10,
            width: 10,
            left: 10,
            top: 10,
        } as DOMRect;
        test('should prepare the argument for the payload', async () => {
            expect(setReferenceShapeAction(arg)).toEqual({
                payload: state.referenceShape,
                type: 'SET_REFERENCE_SHAPE',
            });
        });
    });
});
