import reducer from '../reducer';
import { setFileIdAction, setFileVersionIdAction } from '../actions';

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
});
