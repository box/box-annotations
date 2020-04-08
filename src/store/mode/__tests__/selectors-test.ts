import { getAnnotationMode } from '../selectors';
import { Mode } from '../types';
import initialState from '../../initialState';

describe('store/mode/selectors', () => {
    describe('getAnnotationMode', () => {
        test('should return annotation mode', () => {
            const state = {
                ...initialState,
                mode: { current: Mode.NONE },
            };

            expect(getAnnotationMode(state)).toBe('none');
        });
    });
});
