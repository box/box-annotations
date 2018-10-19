/* eslint-disable no-unused-expressions */
import API from '../API';
import { ANNOTATOR_EVENT, ERROR_TYPE } from '../../constants';

const API_HOST = 'https://app.box.com/api';
let api;

describe('api/API', () => {
    beforeEach(() => {
        api = new API({
            apiHost: API_HOST,
            fileId: 1,
            token: 'someToken'
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
                reason: ERROR_TYPE.auth,
                error: error.toString()
            });
        });
    });
});
