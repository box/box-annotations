/* eslint-disable no-unused-expressions */
import AnnotationAPI from '../AnnotationAPI';
import { ANNOTATOR_EVENT, ERROR_TYPE } from '../../constants';

const API_HOST = 'https://app.box.com/api';
const HTTP_POST = 'POST';
const HTTP_DELETE = 'DELETE';

let api;
const promise = new Promise(jest.fn());

describe('api/AnnotationAPI', () => {
    beforeEach(() => {
        api = new AnnotationAPI({
            apiHost: API_HOST,
            fileId: 1,
            token: 'someToken'
        });
        api.axios = jest.fn().mockReturnValue(promise);
        api.axiosSource = { token: '123abc' };
        api.headers = {};
    });

    describe('getBaseUrl()', () => {
        it('should return the create annotations URL', () => {
            expect(api.getBaseUrl()).toEqual('https://app.box.com/api/2.0/annotations');
        });

        it('should return the delete annotations URL', () => {
            expect(api.getBaseUrl(1)).toEqual('https://app.box.com/api/2.0/annotations/1');
        });
    });

    describe('create()', () => {
        it('post and create a new annotation', () => {
            api.create({}).then(() => {
                expect(api.axios).toBeCalledWith({
                    url: api.getBaseUrl(),
                    data: {},
                    method: HTTP_POST,
                    cancelToken: '123abc',
                    headers: {}
                });
            });
        });
    });

    describe('delete()', () => {
        it('delete the specified annotation', () => {
            api.delete('123').then(() => {
                expect(api.axios).toBeCalledWith({
                    url: api.getBaseUrl('123'),
                    method: HTTP_DELETE,
                    cancelToken: '123abc',
                    headers: {}
                });
            });
        });
    });

    describe('createSuccessHandler()', () => {
        it('should emit an error event', () => {
            api.emit = jest.fn();
            const error = new Error('Could not create annotation');

            api.createSuccessHandler({ type: 'error' }, '123');
            expect(api.emit).toBeCalledWith(ANNOTATOR_EVENT.error, {
                reason: ERROR_TYPE.create,
                error: error.toString()
            });
        });

        it('should return the created annotation', () => {
            expect(api.createSuccessHandler({})).toEqual({});
        });
    });

    describe('deleteSuccessHandler()', () => {
        it('should emit an error event', () => {
            api.emit = jest.fn();
            const error = new Error('Could not delete annotation with ID 123');

            api.deleteSuccessHandler({ type: 'error' }, '123');
            expect(api.emit).toBeCalledWith(ANNOTATOR_EVENT.error, {
                reason: ERROR_TYPE.delete,
                error: error.toString()
            });
        });

        it('should return the deleted annotation', () => {
            expect(api.deleteSuccessHandler({})).toEqual({});
        });
    });
});
