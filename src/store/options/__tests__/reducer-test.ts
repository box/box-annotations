import reducer from '../reducer';
import {
    setFileIdAction,
    setFileVersionIdAction,
    setPermissionsAction,
    setShowResolvedAction,
    setViewModeAction,
} from '../actions';

describe('store/options/reducer', () => {
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

    describe('setShowResolvedAction', () => {
        test('should set whether resolved annotations are shown', () => {
            const newState = reducer(undefined, setShowResolvedAction(false));
            expect(newState.showResolved).toEqual(false);
        });
    });

    describe('setViewModeAction', () => {
        test('should set the view mode', () => {
            const newState = reducer(undefined, setViewModeAction('boundingBoxes'));
            expect(newState.viewMode).toEqual('boundingBoxes');
        });

        test('should default viewMode to annotations in initial state', () => {
            const state = reducer(undefined, setFileIdAction('x'));
            expect(state.viewMode).toEqual('annotations');
        });
    });
});
