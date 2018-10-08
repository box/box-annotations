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
                    message: annotationToSave.message,
                    created_by: {}
                }
            });

            return annotationService.create(annotationToSave).then((createdAnnotation) => {
                expect(createdAnnotation.fileVersionId).toEqual(annotationToSave.fileVersionId);
                expect(createdAnnotation.threadID).toEqual(annotationToSave.threadID);
                expect(createdAnnotation.threadNumber).toEqual(annotationToSave.threadNumber);
                expect(createdAnnotation.type).toEqual(annotationToSave.type);
                expect(createdAnnotation.message).toEqual(annotationToSave.message);
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

    describe('formatAnnotation()', () => {
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
            const annotation1 = annotationService.formatAnnotation(data);

            expect(annotation1 instanceof Annotation).toBeTruthy();
        });
    });
});
