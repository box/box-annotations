import reducer from '../reducer';
import {
    setFileIdAction,
    setFileVersionIdAction,
    setIsDiscoverabilityEnabledAction,
    setPermissionsAction,
} from '../actions';

describe('store/common/reducer', () => {
    describe('setFileIdAction', () => {
        test('should set the file id', () => {
            const newState = reducer(undefined, setFileIdAction('12345'));
            expect(newState.fileId).toEqual('12345');
        });
    });

    describe('setFileVersionIdAction', () => {
        test('should set the file version id', () => {
            const newState = reducer(undefined, setFileVersionIdAction('12345'));
            expect(newState.fileVersionId).toEqual('12345');
        });
    });

    describe('setPermissionsAction', () => {
        test('should set the permissions', () => {
            const newState = reducer(undefined, setPermissionsAction({ can_create_annotations: true }));
            expect(newState.permissions).toEqual({ can_create_annotations: true });
        });
    });

    describe('setIsDiscoverabilityEnabledAction', () => {
        test('should set the isDiscoverabilityFeatureEnabled feature flip', () => {
            const newState = reducer(undefined, setIsDiscoverabilityEnabledAction(true));
            expect(newState.isDiscoverabilityFeatureEnabled).toEqual(true);
        });
    });
});
