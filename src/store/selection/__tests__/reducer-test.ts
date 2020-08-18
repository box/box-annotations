import reducer from '../reducer';
import state from '../__mocks__/selectionState';
import { setSelectionAction } from '../actions';

describe('store/selection/reducer', () => {
    describe('setSelection', () => {
        test('should set selection in state', () => {
            const payload = { ...state.selection, location: 2 };
            const newState = reducer(state, setSelectionAction(payload));

            expect(newState.selection).toEqual(payload);
        });
    });
});
