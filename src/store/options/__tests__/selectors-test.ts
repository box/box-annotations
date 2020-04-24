import { getFileId, getFileVersionId } from '../selectors';

describe('store/options/selectors', () => {
    const optionsState = {
        fileId: '12345',
        fileVersionId: '67890',
    };

    describe('getFileVersionId', () => {
        test('should return the file id', () => {
            expect(getFileId({ options: optionsState })).toBe('12345');
        });
    });

    describe('getFileVersionId', () => {
        test('should return the file version id', () => {
            expect(getFileVersionId({ options: optionsState })).toBe('67890');
        });
    });
});
