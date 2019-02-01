/* eslint-disable no-unused-expressions */
import AnnotationAPI from '../AnnotationAPI';
import { ERROR_TYPE } from '../../constants';

const API_HOST = 'https://app.box.com/api';
const HTTP_POST = 'POST';
const HTTP_DELETE = 'DELETE';

let api;
const promise = new Promise(jest.fn());

describe('api/AnnotationAPI', () => {
    const annotationData = {
        id: '',
        details: {
            location: { page: -1 }
        }
    };

    beforeEach(() => {
        api = new AnnotationAPI({
            apiHost: API_HOST,
            fileId: 1,
            token: 'someToken'
        });
        api.axios = jest.fn().mockReturnValue(promise);
        api.errorHandler = jest.fn();
        api.axiosSource = { token: '123abc' };
        api.headers = {};
    });

    // describe('getBaseUrl()', () => {
    //     it('should return the create annotations URL', () => {
    //         expect(api.getBaseUrl()).toEqual('https://app.box.com/api/2.0/annotations');
    //     });

    //     it('should return the delete annotations URL', () => {
    //         expect(api.getBaseUrl(1)).toEqual('https://app.box.com/api/2.0/annotations/1');
    //     });
    // });

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
            const error = new Error('Could not create annotation');
            error.name = ERROR_TYPE.create;

            api.createSuccessHandler({ type: 'error' });
            expect(api.errorHandler).toBeCalledWith(error);
        });

        it('should return the created annotation', () => {
            const annotation = api.createSuccessHandler(annotationData);
            expect(annotation.location.page).toEqual(1);
            expect(annotation.permissions).toEqual({
                can_delete: true,
                can_edit: true
            });
        });
    });

    describe('deleteSuccessHandler()', () => {
        it('should emit an error event on error', () => {
            const error = new Error('Could not delete annotation with ID 123');
            error.name === ERROR_TYPE.delete;

            api.deleteSuccessHandler({ type: 'error' }, '123');
            expect(api.errorHandler).toBeCalledWith(error);
        });

        it('should emit an error event when response has no annotation id', () => {
            const error = new Error('Could not delete annotation with ID undefined');
            error.name === ERROR_TYPE.delete;

            api.deleteSuccessHandler({ type: 'error' });
            expect(api.errorHandler).toBeCalledWith(error);
        });

        it('should return the deleted annotation', () => {
            expect(api.deleteSuccessHandler({})).toEqual({});
        });
    });
});
