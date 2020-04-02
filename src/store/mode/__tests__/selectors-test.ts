import { getAnnotationMode } from '../selectors';
import { Mode } from '../types';

describe('store/mode/selectors', () => {
    describe('getAnnotationMode', () => {
        test('should return annotation mode', () => {
            const state = {
                mode: { current: Mode.NONE },
            };

            expect(getAnnotationMode(state)).toBe('none');
        });
    });
});
