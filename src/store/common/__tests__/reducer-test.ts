import reducer from '../reducer';
import { toggleAnnotationModeAction, toggleAnnotationVisibilityAction } from '../actions';
import { state } from '../__mocks__/state';
import { Mode } from '../types';

describe('store/common/reducer', () => {
    describe('toggleAnnotationModeAction', () => {
        const { NONE, REGION } = Mode;
        test.each`
            payloadMode | currentMode | expectedMode
            ${REGION}   | ${NONE}     | ${REGION}
            ${REGION}   | ${REGION}   | ${NONE}
        `('should toggle the current mode appropriately', ({ payloadMode, currentMode, expectedMode }) => {
            const newState = reducer({ ...state, mode: currentMode }, toggleAnnotationModeAction(payloadMode));
            expect(newState.mode).toEqual(expectedMode);
        });
    });

    describe('toggleAnnotationVisibilityAction', () => {
        test('should toggle visibility state', () => {
            let newState = reducer(state, toggleAnnotationVisibilityAction());
            expect(newState.visibility).toEqual(false);

            newState = reducer({ ...state, visibility: false }, toggleAnnotationVisibilityAction());
            expect(newState.visibility).toEqual(true);
        });
    });
});
