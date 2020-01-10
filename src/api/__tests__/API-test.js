/* eslint-disable no-unused-expressions */
import API from '../API';
import { ANNOTATOR_EVENT } from '../../constants';

const API_HOST = 'https://app.box.com/api';
let api;

describe('api/API', () => {
    beforeEach(() => {
        api = new API({
            apiHost: API_HOST,
            fileId: 1,
            token: 'someToken',
        });
    });

    describe('generateID()', () => {
        it('should return a rfc4122v4-compliant GUID', () => {
            const GUID = API.generateID();
            const regex = /^[a-z0-9]{8}-[a-z0-9]{4}-4[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{12}$/i;
            expect(GUID.match(regex).length).toBeGreaterThan(0);
        });

        it('should (almost always) return unique GUIDs', () => {
            // eslint-disable-next-line no-self-compare
            expect(API.generateID() === API.generateID()).toBeFalsy();
        });
    });

    describe('destroy()', () => {
        it('should cancel any active axios requests', () => {
            api.axiosSource = { cancel: jest.fn() };
            api.destroy();
            expect(api.axiosSource.cancel).toBeCalled();
        });
    });

    describe('makeRequest()', () => {
        it('should make a REST request', () => {
            const promise = api.makeRequest(new Promise(jest.fn()), jest.fn(), jest.fn());
            expect(promise instanceof Promise).toBeTruthy();
        });
    });

    describe('errorHandler()', () => {
        it('should emit an error event', () => {
            api.emit = jest.fn();
            const error = new Error('something');

            api.errorHandler(error);
            expect(api.emit).toBeCalledWith(ANNOTATOR_EVENT.error, {
                reason: error.name,
                error: error.toString(),
            });
        });
    });

    describe('formatUserInfo()', () => {
        it('should return a properly formatted user', () => {
            const user = api.formatUserInfo({ login: 'me@email.com', profile_image: 'url' });
            expect(user.avatarUrl).toEqual('url');
            expect(user.email).toEqual('me@email.com');
        });
    });

    describe('formatComment()', () => {
        it('should reformat a comment to only contain relevant information', () => {
            api.formatUserInfo = jest.fn();
            const comment = api.formatComment({ threadNumber: '1', message: 'something' });
            expect(comment.threadNumber).toBeUndefined();
            expect(comment.message).toEqual('something');
        });
    });

    describe('appendComments()', () => {
        it('should format and append a valid comment to the annotation comments', () => {
            api.formatComment = jest.fn();
            expect(api.appendComments({}, []).length).toEqual(0);
            expect(api.appendComments({ message: '' }, []).length).toEqual(0);
            expect(api.appendComments({ message: 'something' }, []).length).toEqual(1);
        });
    });
});
