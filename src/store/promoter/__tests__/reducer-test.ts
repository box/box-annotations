import reducer from '../reducer';
import state from '../__mocks__/promoterState';
import { mockContainerRect, mockRange } from '../__mocks__/data';
import { Mode, toggleAnnotationModeAction } from '../../common';
import { setIsPromotingAction, setSelectionAction } from '../actions';

describe('store/promoter/reducer', () => {
    describe('setIsPromoting', () => {
        test.each`
            payload  | isPromoting | selection
            ${true}  | ${true}     | ${null}
            ${false} | ${false}    | ${state.selection}
        `('should set isPromoting and selection in state', ({ isPromoting, payload, selection }) => {
            const newState = reducer(state, setIsPromotingAction(payload));

            expect(newState.isPromoting).toEqual(isPromoting);
            expect(newState.selection).toEqual(selection);
        });
    });

    describe('setSelection', () => {
        test('should set selection in state', () => {
            const payload = { containerRect: mockContainerRect, location: 2, range: mockRange };
            const newState = reducer(state, setSelectionAction(payload));

            expect(newState.selection).toEqual({ ...state.selection, location: 2 });
        });
    });

    describe('toggleAnnotationMode', () => {
        test.each`
            payload           | isPromoting
            ${Mode.HIGHLIGHT} | ${true}
            ${Mode.REGION}    | ${true}
            ${Mode.NONE}      | ${false}
        `('should set isPromoting $isPromoting if mode is $payload', ({ payload, isPromoting }) => {
            const newState = reducer({ ...state, isPromoting: true }, toggleAnnotationModeAction(payload));

            expect(newState.isPromoting).toEqual(isPromoting);
        });
    });
});
