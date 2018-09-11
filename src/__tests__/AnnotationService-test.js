/* eslint-disable no-unused-expressions */
import fetchMock from 'fetch-mock';
import Annotation from '../Annotation';
import AnnotationService from '../AnnotationService';

const API_HOST = 'https://app.box.com/api';

let annotationService;

describe('AnnotationService', () => {
    beforeEach(() => {
        annotationService = new AnnotationService({
            apiHost: API_HOST,
            fileId: 1,
            token: 'someToken',
            canAnnotate: true
        });
        annotationService.emit = jest.fn();
    });

    afterEach(() => {
        fetchMock.restore();
    });

    describe('generateID()', () => {
        it('should return a rfc4122v4-compliant GUID', () => {
            const GUID = AnnotationService.generateID();
            const regex = /^[a-z0-9]{8}-[a-z0-9]{4}-4[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{12}$/i;
            expect(GUID.match(regex).length).toBeGreaterThan(0);
        });

        it('should (almost always) return unique GUIDs', () => {
            // eslint-disable-next-line no-self-compare
            expect(AnnotationService.generateID() === AnnotationService.generateID()).toBeFalsy();
        });
    });

    describe('create()', () => {
        const annotationToSave = new Annotation({
            fileVersionId: 2,
            threadID: AnnotationService.generateID(),
            type: 'point',
            threadNumber: '1',
            text: 'blah',
            location: { x: 0, y: 0 }
        });
        const url = `${API_HOST}/2.0/annotations`;

        it('should create annotation and return created object', () => {
            fetchMock.mock(url, {
                body: {
                    id: AnnotationService.generateID(),
                    item: {
                        id: annotationToSave.fileVersionId
                    },
                    details: {
                        type: annotationToSave.type,
                        threadID: annotationToSave.threadID,
                        location: annotationToSave.location
                    },
                    thread: annotationToSave.threadNumber,
                    message: annotationToSave.text,
                    created_by: {}
                }
            });

            return annotationService.create(annotationToSave).then((createdAnnotation) => {
                expect(createdAnnotation.fileVersionId).toEqual(annotationToSave.fileVersionId);
                expect(createdAnnotation.threadID).toEqual(annotationToSave.threadID);
                expect(createdAnnotation.threadNumber).toEqual(annotationToSave.threadNumber);
                expect(createdAnnotation.type).toEqual(annotationToSave.type);
                expect(createdAnnotation.text).toEqual(annotationToSave.text);
                expect(createdAnnotation.location.x).toEqual(annotationToSave.location.x);
                expect(createdAnnotation.location.y).toEqual(annotationToSave.location.y);
                expect(annotationService.emit).not.toBeCalled();
            });
        });

        it('should reject with an error if there was a problem creating', () => {
            fetchMock.mock(url, {
                body: {
                    type: 'error'
                }
            });

            return annotationService.create(annotationToSave).then(
                () => {
                    throw new Error('Annotation should not be returned');
                },
                (error) => {
                    expect(error.message).toEqual('Could not create annotation');
                    expect(annotationService.emit).toBeCalledWith('annotationerror', {
                        reason: 'create',
                        error: expect.any(String)
                    });
                }
            );
        });
    });

    describe('read()', () => {
        const url = `${API_HOST}/2.0/files/1/annotations?version=2&fields=item,thread,details,message,created_by,created_at,modified_at,permissions`;

        it('should return array of annotations for the specified file and file version', () => {
            const annotation1 = new Annotation({
                fileVersionId: 2,
                threadID: AnnotationService.generateID(),
                type: 'point',
                text: 'blah',
                threadNumber: '1',
                location: { x: 0, y: 0 }
            });

            const annotation2 = new Annotation({
                fileVersionId: 2,
                threadID: AnnotationService.generateID(),
                type: 'highlight',
                text: 'blah2',
                threadNumber: '2',
                location: { x: 0, y: 0 }
            });

            fetchMock.mock(url, {
                body: {
                    entries: [
                        {
                            id: AnnotationService.generateID(),
                            item: {
                                id: annotation1.fileVersionId
                            },
                            details: {
                                type: annotation1.type,
                                threadID: annotation1.threadID,
                                location: annotation1.location
                            },
                            message: annotation1.text,
                            thread: annotation1.threadNumber,
                            created_by: {}
                        },
                        {
                            id: AnnotationService.generateID(),
                            item: {
                                id: annotation2.fileVersionId
                            },
                            details: {
                                type: annotation2.type,
                                threadID: annotation2.threadID,
                                location: annotation2.location
                            },
                            message: annotation2.text,
                            threadNumber: annotation2.threadNumber,
                            created_by: {}
                        }
                    ]
                }
            });

            return annotationService.read(2).then((annotations) => {
                expect(Object.keys(annotations).length).toEqual(2);

                const firstAnnotationId = Object.keys(annotations)[0];
                const createdAnnotation1 = annotations[firstAnnotationId];
                expect(createdAnnotation1.text).toEqual(annotation1.text);

                const secondAnnotationId = Object.keys(annotations)[1];
                const createdAnnotation2 = annotations[secondAnnotationId];
                expect(createdAnnotation2.text).toEqual(annotation2.text);
            });
        });

        it('should reject with an error if there was a problem reading', () => {
            fetchMock.mock(url, {
                body: {
                    type: 'error'
                }
            });

            return annotationService.read(2).then(
                () => {
                    throw new Error('Annotations should not be returned');
                },
                (error) => {
                    expect(error.message).toEqual('Could not read annotations from file version with ID 2');
                }
            );
        });
    });

    describe('delete()', () => {
        const url = `${API_HOST}/2.0/annotations/3`;

        it('should successfully delete the annotation', () => {
            fetchMock.mock(url, 204);
            return annotationService.delete(3).then(() => {
                expect(fetchMock.called(url)).toBeTruthy();
                expect(annotationService.emit).not.toBeCalled();
            });
        });

        it('should reject with an error if there was a problem deleting', () => {
            fetchMock.mock(url, {
                body: {
                    type: 'error'
                }
            });

            return annotationService.delete(3).then(
                () => {
                    throw new Error('Annotation should not have been deleted');
                },
                (error) => {
                    expect(error.message).toEqual('Could not delete annotation with ID 3');
                    expect(annotationService.emit).toBeCalledWith('annotationerror', {
                        reason: 'delete',
                        error: expect.any(String)
                    });
                }
            );
        });
    });

    describe('getThreadMap()', () => {
        it('should call read and then generate a map of thread ID to annotations in those threads', () => {
            const annotation1 = new Annotation({
                fileVersionId: 2,
                annotationID: 1,
                type: 'point',
                text: 'blah',
                threadNumber: '1',
                threadID: '123abc',
                location: { x: 0, y: 0 }
            });

            const annotation2 = new Annotation({
                fileVersionId: 2,
                annotationID: 2,
                type: 'point',
                text: 'blah2',
                threadNumber: '2',
                threadID: '456def',
                location: { x: 0, y: 0 }
            });

            const annotation3 = new Annotation({
                fileVersionId: 2,
                annotationID: 3,
                type: 'point',
                text: 'blah3',
                threadNumber: '1',
                threadID: '123abc',
                location: { x: 0, y: 0 }
            });

            const threads = {
                1: annotation1,
                2: annotation2,
                3: annotation3
            };
            annotationService.read = jest.fn().mockResolvedValue(threads);
            annotationService.createThreadMap = jest.fn().mockReturnValue(threads);

            return annotationService.getThreadMap(2).then(() => {
                expect(annotationService.createThreadMap).toBeCalled();
            });
        });
    });

    describe('createThreadMap()', () => {
        it('should create a thread map with the correct annotations', () => {
            const annotation1 = new Annotation({
                fileVersionId: 2,
                annotationID: 1,
                type: 'point',
                text: 'blah',
                threadNumber: '1',
                threadID: '123abc',
                location: { x: 0, y: 0 }
            });

            const annotation2 = new Annotation({
                fileVersionId: 2,
                annotationID: 2,
                type: 'point',
                text: 'blah2',
                threadNumber: '2',
                threadID: '456def',
                location: { x: 0, y: 0 }
            });

            const annotation3 = new Annotation({
                fileVersionId: 2,
                annotationID: 3,
                type: 'point',
                text: 'blah3',
                threadNumber: '1',
                threadID: '123abc',
                location: { x: 0, y: 0 }
            });

            const annotation4 = new Annotation({
                fileVersionId: 2,
                annotationID: 4,
                type: 'point',
                text: 'blah4',
                threadNumber: '1',
                threadID: '123abc',
                location: { x: 0, y: 0 }
            });

            const threadMap = annotationService.createThreadMap([annotation1, annotation2, annotation3, annotation4]);

            expect(Object.keys(threadMap[annotation1.threadID]).length).toEqual(3);

            const thread = threadMap[annotation1.threadID];
            expect(thread[0]).toStrictEqual(annotation1);
            expect(thread[0].threadNumber).toEqual(annotation1.threadNumber);
            expect(thread).not.toContain(annotation2);
        });
    });

    describe('createAnnotation()', () => {
        it('should call the Annotation constructor', () => {
            const data = {
                fileVersionId: 2,
                threadID: 1,
                type: 'point',
                text: 'blah3',
                threadNumber: '1',
                location: { x: 0, y: 0 },
                created: Date.now(),
                item: { id: 1 },
                details: { threadID: 1 },
                created_by: { id: 1 }
            };
            const annotation1 = annotationService.createAnnotation(data);

            expect(annotation1 instanceof Annotation).toBeTruthy();
        });
    });

    describe('readFromMarker()', () => {
        it('should get subsequent annotations if a marker is present', () => {
            const markerUrl = annotationService.getReadUrl(2, 'a', 1);

            const annotation2 = new Annotation({
                fileVersionId: 2,
                threadID: AnnotationService.generateID(),
                type: 'highlight',
                text: 'blah2',
                threadNumber: '1',
                location: { x: 0, y: 0 }
            });

            fetchMock.mock(markerUrl, {
                body: {
                    entries: [
                        {
                            id: AnnotationService.generateID(),
                            item: {
                                id: annotation2.fileVersionId
                            },
                            details: {
                                type: annotation2.type,
                                threadID: annotation2.threadID,
                                location: annotation2.location
                            },
                            thread: annotation2.threadNumber,
                            message: annotation2.text,
                            created_by: {}
                        }
                    ]
                }
            });

            let resolve;
            let reject;
            const promise = new Promise((success, failure) => {
                resolve = success;
                reject = failure;
            });

            annotationService.annotations = [];
            annotationService.readFromMarker(resolve, reject, 2, 'a', 1);
            promise.then((result) => {
                expect(result.length).toEqual(1);
                const firstAnnotation = result[0];
                expect(firstAnnotation.text).toEqual(annotation2.text);
                expect(firstAnnotation.threadNumber).toEqual(annotation2.threadNumber);
            });
        });

        it('should reject with an error and show a notification if there was a problem reading', () => {
            const markerUrl = annotationService.getReadUrl(2, 'a', 1);

            fetchMock.mock(markerUrl, {
                body: {
                    type: 'error'
                }
            });

            let resolve;
            let reject;
            const promise = new Promise((success, failure) => {
                resolve = success;
                reject = failure;
            });

            annotationService.annotations = [];
            annotationService.readFromMarker(resolve, reject, 2, 'a', 1);
            return promise.then(
                () => {
                    throw new Error('Annotation should not have been deleted');
                },
                (error) => {
                    expect(error.message).toEqual('Could not read annotations from file version with ID 2');
                    expect(annotationService.emit).toBeCalledWith('annotationerror', {
                        reason: 'read',
                        error: expect.any(String)
                    });
                }
            );
        });

        it('should reject with an error and show a notification if the token is invalid', () => {
            const markerUrl = annotationService.getReadUrl(2, 'a', 1);

            fetchMock.mock(markerUrl, 401);

            let resolve;
            let reject;
            const promise = new Promise((success, failure) => {
                resolve = success;
                reject = failure;
            });

            annotationService.annotations = [];
            annotationService.readFromMarker(resolve, reject, 2, 'a', 1);
            return promise.catch((error) => {
                expect(error.message).toEqual('Could not read annotations from file due to invalid or expired token');
                expect(annotationService.emit).toBeCalledWith('annotationerror', {
                    reason: 'authorization',
                    error: expect.any(String)
                });
            });
        });
    });

    describe('getReadUrl()', () => {
        it('should return the original url if no limit or marker exists', () => {
            annotationService.api = 'box';
            annotationService.fileId = 1;
            const fileVersionId = 2;
            const url = `${annotationService.api}/2.0/files/${
                annotationService.fileId
            }/annotations?version=${fileVersionId}&fields=item,thread,details,message,created_by,created_at,modified_at,permissions`;

            const result = annotationService.getReadUrl(fileVersionId);
            expect(result).toEqual(url);
        });

        it('should add a marker and limit if provided', () => {
            annotationService.api = 'box';
            annotationService.fileId = 1;
            const fileVersionId = 2;
            const marker = 'next_annotation';
            const limit = 1;
            const url = `${annotationService.api}/2.0/files/${
                annotationService.fileId
            }/annotations?version=${fileVersionId}&fields=item,thread,details,message,created_by,created_at,modified_at,permissions&marker=${marker}&limit=${limit}`;

            const result = annotationService.getReadUrl(fileVersionId, marker, limit);
            expect(result).toEqual(url);
        });
    });
});
