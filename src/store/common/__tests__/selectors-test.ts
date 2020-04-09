import commonState from '../__mocks__/commonState';
import { getAnnotationMode, getVisibility } from '../selectors';

describe('store/common/selectors', () => {
    describe('getAnnotationMode', () => {
        test('should return annotation mode', () => {
            expect(getAnnotationMode({ common: commonState })).toBe('none');
        });
    });

    describe('getVisibility', () => {
        test('should return annotation visibility', () => {
            expect(getVisibility({ common: commonState })).toBe(true);
        });
    });
});
