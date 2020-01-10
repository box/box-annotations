/* eslint-disable no-unused-expressions */
import FileVersionAPI from '../FileVersionAPI';
import { ERROR_TYPE, TYPES } from '../../constants';

const API_HOST = 'https://app.box.com/api';

let api;
const promise = new Promise(jest.fn());

describe('api/FileVersionAPI', () => {
    beforeEach(() => {
        api = new FileVersionAPI({
            apiHost: API_HOST,
            fileId: 1,
            token: 'someToken',
            permissions: {},
        });
        api.axios = {
            get: jest.fn().mockReturnValue(promise),
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
                    params: 'params',
                });
            });
        });
    });

    describe('successHandler()', () => {
        beforeEach(() => {
            api.fetchFromMarker = jest.fn().mockReturnValue(Promise.resolve());
            api.emit = jest.fn();
            api.data = {
                entries: [],
            };
        });

        it('should call fetch the remaining annotations if the version has more to fetch', () => {
            api.data = { entries: [{}] };
            api.successHandler({ entries: [{}, {}], next_marker: 'marker', limit: 1 }).then(() => {
                expect(api.data.entries.length).toEqual(3);
                expect(api.fetchFromMarker).toBeCalled();
            });
        });

        it('should not call fetch if no more annotations need to be fetched', () => {
            api.data = { entries: [{}] };
            api.successHandler({ entries: [{}, {}], limit: 1 }).then(() => {
                expect(api.data.entries.length).toEqual(3);
                expect(api.fetchFromMarker).not.toBeCalled();
            });
        });

        it('should emit an error if the entries in the success response is not an array', () => {
            api.fileVersionId = 123;
            api.successHandler({ entries: 'wrong type' }).catch(err => {
                expect(err.name).toEqual(ERROR_TYPE.read);
                expect(api.fetchFromMarker).not.toBeCalled();
            });
        });

        it('should emit an error if the success response is of type error', () => {
            api.fileVersionId = 123;
            api.successHandler({ type: 'error' }).catch(err => {
                expect(err.name).toEqual(ERROR_TYPE.read);
                expect(api.fetchFromMarker).not.toBeCalled();
            });
        });
    });

    describe('createAnnotationMap()', () => {
        it('should create a map of thread IDs to annotations', () => {
            const annotationData = {
                item: {},
                permissions: {},
                details: {
                    location: { page: -1 },
                    type: TYPES.highlight,
                    threadID: '123',
                },
            };

            api.data = {
                entries: [
                    {
                        // invalid location
                        ...annotationData,
                        details: {
                            type: TYPES.highlight,
                            threadID: '123',
                        },
                    },
                    {
                        // invalid type
                        ...annotationData,
                        details: {
                            location: { page: -1 },
                            threadID: '123',
                        },
                    },
                    {
                        // invalid threadID
                        ...annotationData,
                        details: {
                            location: { page: -1 },
                            type: TYPES.highlight,
                        },
                    },
                    // plain highlight
                    { ...annotationData, id: 1 },
                    {
                        // comment added onto an existing plain highlight
                        ...annotationData,
                        id: 2,
                        message: 'string',
                        details: {
                            location: { page: 1 },
                            type: TYPES.highlight_comment,
                            threadID: '123',
                        },
                    },
                ],
            };

            const annotationMap = api.createAnnotationMap();
            expect(Object.keys(annotationMap).length).toEqual(1);
            expect(annotationMap['123'].comments.length).toEqual(1);
            expect(annotationMap['123'].type).toEqual(TYPES.highlight_comment);
        });
    });
});
