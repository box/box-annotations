import commonState from '../__mocks__/commonState';
import { getAnnotationMode } from '../selectors';

describe('store/common/selectors', () => {
    describe('getAnnotationMode', () => {
        test('should return annotation mode', () => {
            expect(getAnnotationMode({ common: commonState })).toBe('none');
        });
    });
});
