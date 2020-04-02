import { getAnnotationMode } from '../selectors';

describe('store/mode/selectors', () => {
    describe('getAnnotationMode', () => {
        test('should return annotation mode', () => {
            const state = {
                mode: { current: 'none' },
            };

            expect(getAnnotationMode(state)).toBe('none');
        });
    });
});
