import commonState from '../__mocks__/commonState';
import { getAnnotationMode, getColor } from '../selectors';

describe('store/common/selectors', () => {
    const state = { common: commonState };

    describe('getAnnotationMode', () => {
        test('should return annotation mode', () => {
            expect(getAnnotationMode(state)).toBe('none');
        });
    });

    describe('getColor', () => {
        test('should return the current creator color', () => {
            expect(getColor(state)).toBe('#000');
        });
    });
});
