/* eslint-disable no-unused-expressions */
import FileVersionAPI from '../FileVersionAPI';
import { ANNOTATOR_EVENT, ERROR_TYPE } from '../../constants';

const API_HOST = 'https://app.box.com/api';

let api;
const promise = new Promise(jest.fn());

describe('api/FileVersionAPI', () => {
    beforeEach(() => {
        api = new FileVersionAPI({
            apiHost: API_HOST,
            fileId: 1,
            token: 'someToken'
        });
        api.axios = {
            get: jest.fn().mockReturnValue(promise)
        };
        api.axiosSource = { token: '123abc' };
        api.headers = {};
    });

    describe('getBaseUrl()', () => {
        it('should return the read annotations URL', () => {
            expect(api.getBaseUrl()).toEqual('https://app.box.com/api/2.0/files/1/annotations');
        });
    });

    describe('fetchVersionAnnotations()', () => {
        it('should fetch and organize the annotaitons for the specified file version id', () => {
            api.createAnnotationMap = jest.fn();
            api.fetchFromMarker = jest.fn().mockReturnValue(promise);

            api.fetchVersionAnnotations('123').then(() => {
                expect(api.fileVersionId).toEqual('123');
                expect(api.fetchFromMarker).toBeCalled();
                expect(api.createAnnotationMap).toBeCalled();
            });
        });
    });

    describe('fetchFromMarker()', () => {
        it('should fetch all annotations from the specified file version id', () => {
            api.fetchFromMarker('params').then(() => {
                expect(api.axios.get).toBeCalledWith(api.getBaseUrl(), {
                    cancelToken: '123abc',
                    headers: {},
                    params: 'params'
                });
            });
        });
    });

    describe('successHandler()', () => {
        beforeEach(() => {
            api.fetchFromMarker = jest.fn();
            api.emit = jest.fn();
        });

        it('should call fetch the remaining annotations if the version has more to fetch', () => {
            api.data = { entries: [{}] };
            api.successHandler({ entries: [{}, {}], next_marker: 'marker', limit: 1 });
            expect(api.data.entries.length).toEqual(3);
            expect(api.fetchFromMarker).toBeCalled();
        });

        it('should not call fetch if no more annotations need to be fetched', () => {
            api.data = { entries: [{}] };
            api.successHandler({ entries: [{}, {}], limit: 1 });
            expect(api.data.entries.length).toEqual(3);
            expect(api.fetchFromMarker).not.toBeCalled();
        });

        it('should emit an error if the success response is of type error', () => {
            api.fileVersionId = 123;
            api.successHandler({ type: 'error' });
            const error = new Error(`Could not read annotations from file version with ID ${api.fileVersionId}`);

            expect(api.data.entries.length).toEqual(1);
            expect(api.fetchFromMarker).not.toBeCalled();
            expect(api.emit).toBeCalledWith(ANNOTATOR_EVENT.error, {
                reason: ERROR_TYPE.read,
                error: error.toString()
            });
        });
    });

    describe('createAnnotationMap()', () => {
        it('should create a map of thread IDs to annotations', () => {
            api.data = {
                entries: [{ id: 1, threadID: 1, item: {}, details: {} }, { id: 2, threadID: 1, item: {}, details: {} }]
            };
            const threadMap = api.createAnnotationMap();
            expect(Object.keys(threadMap).length).toEqual(1);
        });
    });
});
