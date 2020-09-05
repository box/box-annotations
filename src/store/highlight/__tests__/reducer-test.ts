import reducer from '../reducer';
import state from '../__mocks__/highlightState';
import { Annotation, NewAnnotation } from '../../../@types';
import { createAnnotationAction } from '../../annotations';
import { mockContainerRect, mockRange } from '../__mocks__/data';
import { resetCreatorAction } from '../../creator';
import { setIsPromotingAction, setSelectionAction, setIsSelectingAction } from '../actions';

describe('store/highlight/reducer', () => {
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

    describe('setIsSelecting', () => {
        test.each([true, false])('should set isSelecting in state as %s', payload => {
            const newState = reducer(state, setIsSelectingAction(payload));

            expect(newState.isSelecting).toEqual(payload);
        });
    });

    describe('setSelection', () => {
        test('should set selection in state', () => {
            const payload = { containerRect: mockContainerRect, location: 2, range: mockRange };
            const newState = reducer(state, setSelectionAction(payload));

            expect(newState.selection).toEqual({ ...state.selection, location: 2 });
        });
    });

    describe('createAnnotationAction', () => {
        test('should reset isPromoting when creation success', () => {
            const newState = reducer(
                { ...state, isPromoting: true },
                createAnnotationAction.fulfilled({} as Annotation, 'test', {} as NewAnnotation),
            );

            expect(newState.isPromoting).toEqual(false);
        });
    });

    describe('resetCreatorAction', () => {
        test('should reset isPromoting when reset creator', () => {
            const newState = reducer({ ...state, isPromoting: true }, resetCreatorAction());

            expect(newState.isPromoting).toEqual(false);
        });
    });
});
