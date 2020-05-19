import { getFileId, getFileVersionId, getPermissions } from '../selectors';

describe('store/options/selectors', () => {
    const optionsState = {
        fileId: '12345',
        fileVersionId: '67890',
        permissions: {
            can_create_annotations: true,
            can_view_annotations: true,
        },
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

    describe('getPermissions', () => {
        test('should return the permissions', () => {
            expect(getPermissions({ options: optionsState })).toEqual({
                can_create_annotations: true,
                can_view_annotations: true,
            });
        });
    });
});
