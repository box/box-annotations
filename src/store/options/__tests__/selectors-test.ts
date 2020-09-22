import {
    getFeatures,
    getFileId,
    getFileVersionId,
    getPermissions,
    getRotation,
    getScale,
    isFeatureEnabled,
} from '../selectors';

describe('store/options/selectors', () => {
    const optionsState = {
        features: { enabledFeature: true },
        fileId: '12345',
        fileVersionId: '67890',
        isCurrentFileVersion: true,
        permissions: {
            can_create_annotations: true,
            can_view_annotations: true,
        },
        rotation: 0,
        scale: 1,
    };

    describe('getFeatures', () => {
        test('should return the features', () => {
            expect(getFeatures({ options: optionsState })).toEqual({ enabledFeature: true });
        });
    });

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

    describe('getRotation', () => {
        test('should return the current rotation', () => {
            expect(getRotation({ options: optionsState })).toBe(0);
        });
    });

    describe('getScale', () => {
        test('should return the current scale', () => {
            expect(getScale({ options: optionsState })).toBe(1);
        });
    });

    describe('isFeatureEnabled', () => {
        test('should return value for feature in the features object', () => {
            expect(isFeatureEnabled({ options: optionsState }, 'enabledFeature')).toBe(true);
        });

        test('should return false for feature not in the features object', () => {
            expect(isFeatureEnabled({ options: optionsState }, 'nonExistentFeature')).toBe(false);
        });
    });
});
