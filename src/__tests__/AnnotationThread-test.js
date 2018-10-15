/* eslint-disable no-unused-expressions */
import AnnotationThread from '../AnnotationThread';
import * as util from '../util';
import {
    STATES,
    TYPES,
    CLASS_ANNOTATION_POINT_MARKER,
    DATA_TYPE_ANNOTATION_INDICATOR,
    THREAD_EVENT
} from '../constants';

let thread;
const html = '<div class="annotated-element"></div>';

describe('AnnotationThread', () => {
    let rootElement;

    let api = {
        user: { id: '1' },
        formatAnnotation: jest.fn()
    };

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        thread = new AnnotationThread({
            annotatedElement: rootElement,
            annotations: [],
            api,
            fileVersionId: '1',
            isMobile: false,
            location: {},
            threadID: '2',
            threadNumber: '1',
            type: 'point'
        });

        thread.emit = jest.fn();
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        thread = null;
    });

    describe('destroy()', () => {
        beforeEach(() => {
            thread.state = STATES.pending;
            thread.unbindDOMListeners = jest.fn();
            thread.unmountPopover = jest.fn();
        });

        it('should unbind listeners and remove thread element and broadcast that the thread was deleted', () => {
            thread.destroy();
            expect(thread.unbindDOMListeners).toBeCalled();
            expect(thread.emit).not.toBeCalledWith(THREAD_EVENT.threadDelete);
            expect(thread.unmountPopover).toBeCalled();
        });

        it('should emit annotationthreaddeleted only if thread is not in a pending state', () => {
            thread.state = STATES.inactive;
            thread.destroy();
            expect(thread.unbindDOMListeners).toBeCalled();
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.threadDelete);
            expect(thread.unmountPopover).toBeCalled();
        });
    });

    describe('hide()', () => {
        it('should hide the thread element', () => {
            thread.unmountPopover = jest.fn();
            thread.hide();
            expect(thread.unmountPopover).toBeCalled();
            expect(thread.state).toEqual(STATES.inactive);
        });
    });

    describe('reset()', () => {
        it('should set the thread state to inactive', () => {
            thread.reset();
            expect(thread.state).toEqual(STATES.inactive);
        });
    });

    describe('saveAnnotation()', () => {
        beforeEach(() => {
            thread.getThreadEventData = jest.fn().mockReturnValue({});
            thread.handleThreadSaveError = jest.fn();
            thread.updateTemporaryAnnotation = jest.fn();
            thread.renderAnnotationPopover = jest.fn();
        });

        it('should save an annotation with the specified type and text', (done) => {
            thread.api.create = jest.fn().mockResolvedValue({});

            const promise = thread.saveAnnotation('point', 'blah');
            promise.then(() => {
                expect(thread.updateTemporaryAnnotation).toBeCalled();
                done();
            });
            expect(thread.api.create).toBeCalled();
        });

        it('should delete the temporary annotation and broadcast an error if there was an error saving', (done) => {
            thread.api.create = jest.fn().mockRejectedValue({});

            const promise = thread.saveAnnotation('point', 'blah');
            promise.then(() => {
                expect(thread.handleThreadSaveError).toBeCalled();
                done();
            });
            expect(thread.api.create).toBeCalled();
            expect(thread.updateTemporaryAnnotation).not.toBeCalled();
        });
    });

    describe('updateTemporaryAnnotation()', () => {
        const tempAnnotation = { id: 1 };
        const serverAnnotation = { id: 456, threadNumber: 1 };

        beforeEach(() => {
            thread.api.create = jest.fn();
            thread.api.formatAnnotation = jest.fn().mockReturnValue(serverAnnotation);
            thread.getThreadEventData = jest.fn().mockReturnValue({});
            thread.renderAnnotationPopover = jest.fn();
            thread.annotations = [tempAnnotation];
        });

        it('should save annotation to thread if it does not exist in annotations array', () => {
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.annotations).toContain(serverAnnotation);
        });

        it('should overwrite a local annotation to the thread if it does exist as an associated annotation', () => {
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.annotations).not.toContain(tempAnnotation);
            expect(thread.annotations).toContain(serverAnnotation);
        });

        it('should emit an annotationsaved event on success', () => {
            thread.threadNumber = undefined;
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.save);
        });

        it('should only render popover on desktop', () => {
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.renderAnnotationPopover).toBeCalled();
            expect(thread.state).toEqual(STATES.pending);
        });

        it('should only render popover on mobile', () => {
            thread.isMobile = true;
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.renderAnnotationPopover).toBeCalled();
            expect(thread.state).toEqual(STATES.hover);
        });
    });

    describe('deleteAnnotation()', () => {
        let annotation;
        let annotation2;
        const threadPromise = Promise.resolve();

        beforeEach(() => {
            api = {
                user: { id: 1 },
                delete: jest.fn().mockResolvedValue(threadPromise)
            };

            annotation = {
                id: 'someID',
                permissions: {
                    can_delete: true
                },
                threadID: 1
            };

            annotation2 = {
                id: 'someID2',
                permissions: {
                    can_delete: false
                },
                threadID: 1
            };

            thread.api = api;
            thread.annotations = [annotation];
            util.isPlainHighlight = jest.fn();
            thread.cancelFirstComment = jest.fn();
            thread.destroy = jest.fn();
            thread.renderAnnotationPopover = jest.fn();
            thread.getThreadEventData = jest.fn().mockReturnValue({
                threadNumber: 1
            });
            thread.emit = jest.fn();
        });

        it('should destroy the thread if the deleted annotation was the last annotation in the thread', (done) => {
            thread.isMobile = false;

            const promise = thread.deleteAnnotation('someID', false);
            promise.then(() => {
                threadPromise.then(() => {
                    expect(thread.destroy).toBeCalled();
                    expect(thread.renderAnnotationPopover).not.toBeCalled();
                    done();
                });
            });
        });

        it('should remove the relevant annotation from its dialog if the deleted annotation was not the last one', (done) => {
            thread.annotations.push(annotation2);
            const promise = thread.deleteAnnotation('someID', false);
            promise.then(() => {
                expect(thread.renderAnnotationPopover).toBeCalled();
                done();
            });
        });

        it('should make a server call to delete an annotation with the specified ID if useServer is true', (done) => {
            thread.annotations.push(annotation2);
            const promise = thread.deleteAnnotation('someID', true);
            promise.then(() => {
                expect(thread.emit).not.toBeCalledWith(THREAD_EVENT.threadCleanup);
                expect(api.delete).toBeCalledWith('someID');
                done();
            });
        });

        it('should also delete blank highlight comment from the server when removing the last comment on a highlight thread', (done) => {
            annotation2.permissions.can_delete = false;
            thread.annotations.push(annotation2);
            util.isPlainHighlight = jest.fn().mockReturnValue(true);

            const promise = thread.deleteAnnotation('someID', true);
            promise.then(() => {
                expect(api.delete).toBeCalledWith('someID');
                done();
            });
        });

        it('should not make a server call to delete an annotation with the specified ID if useServer is false', (done) => {
            const promise = thread.deleteAnnotation('someID', false);
            promise.then(() => {
                expect(api.delete).not.toBeCalled();
                done();
            });
        });

        it('should broadcast an error if there was an error deleting from server', (done) => {
            api.delete = jest.fn().mockRejectedValue();
            thread.api = api;

            const promise = thread.deleteAnnotation('someID', true);
            expect(api.delete).toBeCalled();
            promise.catch(() => {
                done();
            });
        });

        it('should toggle highlight dialogs with the delete of the last comment if user does not have permission to delete the entire annotation', () => {
            thread.annotations.push(annotation2);
            util.isPlainHighlight = jest.fn().mockReturnValue(true);

            const promise = thread.deleteAnnotation('someID');
            promise.then(() => {
                expect(thread.cancelFirstComment).toBeCalled();
                expect(thread.destroy).not.toBeCalled();
            });
        });

        it('should destroy the annotation with the delete of the last comment if the user has permissions', () => {
            annotation2.permissions.can_delete = true;
            thread.annotations.push(annotation2);
            util.isPlainHighlight = jest.fn().mockReturnValue(true);

            const promise = thread.deleteAnnotation('someID');
            promise.then(() => {
                expect(thread.emit).toBeCalledWith(THREAD_EVENT.threadCleanup);
                expect(thread.emit).toBeCalledWith(THREAD_EVENT.delete);
                expect(thread.cancelFirstComment).not.toBeCalled();
                expect(thread.destroy).toBeCalled();
            });
        });
    });

    describe('scrollIntoView()', () => {
        it('should scroll to annotation page and center annotation in viewport', () => {
            thread.scrollToPage = jest.fn();
            thread.centerAnnotation = jest.fn();
            thread.scrollIntoView();
            expect(thread.scrollToPage);
            expect(thread.centerAnnotation).toBeCalledWith(expect.any(Number));
        });
    });

    describe('scrollToPage()', () => {
        it('should do nothing if annotation does not have a location or page', () => {
            const pageEl = {
                scrollIntoView: jest.fn()
            };

            thread.location = {};
            thread.scrollToPage();

            thread.location = null;
            thread.scrollToPage();
            expect(pageEl.scrollIntoView).not.toBeCalled();
        });

        it('should scroll annotation\'s page into view', () => {
            thread.location = { page: 1 };
            const pageEl = {
                scrollIntoView: jest.fn()
            };
            thread.annotatedElement = {
                querySelector: jest.fn().mockReturnValue(pageEl)
            };
            thread.scrollToPage();
            expect(pageEl.scrollIntoView).toBeCalled();
        });
    });

    describe('centerAnnotation', () => {
        beforeEach(() => {
            thread.annotatedElement = {
                scrollHeight: 100,
                scrollTop: 0,
                scrollBottom: 200
            };
        });

        it('should scroll so annotation is vertically centered in viewport', () => {
            thread.centerAnnotation(50);
            expect(thread.annotatedElement.scrollTop).toEqual(50);
        });

        it('should scroll so annotation is vertically centered in viewport', () => {
            thread.centerAnnotation(150);
            expect(thread.annotatedElement.scrollTop).toEqual(200);
        });
    });

    describe('location()', () => {
        it('should get location', () => {
            expect(thread.location).toEqual(thread.location);
        });
    });

    describe('threadID()', () => {
        it('should get threadID', () => {
            expect(thread.threadID).toEqual(thread.threadID);
        });
    });

    describe('thread()', () => {
        it('should get thread', () => {
            expect(thread.thread).toEqual(thread.thread);
        });
    });

    describe('type()', () => {
        it('should get type', () => {
            expect(thread.type).toEqual(thread.type);
        });
    });

    describe('state()', () => {
        it('should get state', () => {
            expect(thread.state).toEqual(thread.state);
        });
    });

    describe('setup()', () => {
        beforeEach(() => {
            thread.setupElement = jest.fn();
            thread.destroy = jest.fn();
        });

        it('should set state to pending if thread is initialized with no annotations', () => {
            thread.setup();
            expect(thread.state).toEqual(STATES.pending);
        });

        it('should set state to inactive if thread is initialized with annotations', () => {
            thread.annotations = [{}];
            thread.setup();
            expect(thread.state).toEqual(STATES.inactive);
        });
    });

    describe('setupElement()', () => {
        it('should create element and bind listeners', () => {
            thread.bindDOMListeners = jest.fn();
            thread.setupElement();
            expect(thread.element instanceof HTMLElement).toBeTruthy();
            expect(thread.element.classList).toContain(CLASS_ANNOTATION_POINT_MARKER);
            expect(thread.bindDOMListeners).toBeCalled();
        });
    });

    describe('bindDOMListeners()', () => {
        beforeEach(() => {
            thread.element = document.createElement('div');
            thread.element.addEventListener = jest.fn();
            thread.isMobile = false;
        });

        it('should bind DOM listeners', () => {
            thread.bindDOMListeners();
            expect(thread.element.addEventListener).toBeCalledWith('click', expect.any(Function));
        });

        it('should not add mouseleave listener for mobile browsers', () => {
            thread.isMobile = true;
            thread.bindDOMListeners();
            expect(thread.element.addEventListener).toBeCalledWith('click', expect.any(Function));
        });
    });

    describe('unbindDOMListeners()', () => {
        beforeEach(() => {
            thread.element = document.createElement('div');
            thread.element.removeEventListener = jest.fn();
            thread.isMobile = false;
        });

        it('should unbind DOM listeners', () => {
            thread.unbindDOMListeners();
            expect(thread.element.removeEventListener).toBeCalledWith('click', expect.any(Function));
        });

        it('should not add mouseleave listener for mobile browsers', () => {
            thread.isMobile = true;
            thread.unbindDOMListeners();
            expect(thread.element.removeEventListener).toBeCalledWith('click', expect.any(Function));
        });
    });

    describe('cancelUnsavedAnnotation()', () => {
        beforeEach(() => {
            thread.destroy = jest.fn();
            thread.unmountPopover = jest.fn();
        });

        it('should destroy thread if in a pending/pending-active state', () => {
            util.isPending = jest.fn().mockReturnValue(true);
            thread.cancelUnsavedAnnotation();
            expect(thread.destroy).toBeCalled();
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.cancel);
            expect(thread.unmountPopover).not.toBeCalled();
        });

        it('should not destroy thread if not in a pending/pending-active state', () => {
            util.isPending = jest.fn().mockReturnValue(false);
            thread.cancelUnsavedAnnotation();
            expect(thread.destroy).not.toBeCalled();
            expect(thread.emit).not.toBeCalledWith(THREAD_EVENT.cancel);
            expect(thread.unmountPopover).toBeCalled();
        });
    });

    describe('getThreadEventData()', () => {
        it('should return thread type and threadID', () => {
            thread.api.user = { id: -1 };
            thread.threadNumber = undefined;
            const data = thread.getThreadEventData();
            expect(data).toStrictEqual({
                type: thread.type,
                threadID: thread.threadID
            });
        });

        it('should also return annotator\'s user id', () => {
            thread.api.user = { id: 1 };
            thread.threadNumber = undefined;
            const data = thread.getThreadEventData();
            expect(data).toStrictEqual({
                type: thread.type,
                threadID: thread.threadID,
                userId: 1
            });
        });

        it('should return thread type and threadID', () => {
            thread.api.user = { id: -1 };
            thread.threadNumber = 1;
            const data = thread.getThreadEventData();
            expect(data).toStrictEqual({
                type: thread.type,
                threadID: thread.threadID,
                threadNumber: 1
            });
        });
    });

    describe('createElement()', () => {
        it('should create an element with the right class and attribute', () => {
            const element = thread.createElement();
            expect(element.classList).toContain(CLASS_ANNOTATION_POINT_MARKER);
            expect(element.dataset.type).toEqual(DATA_TYPE_ANNOTATION_INDICATOR);
        });
    });

    describe('createAnnotation()', () => {
        it('should create a new point annotation', () => {
            thread.saveAnnotation = jest.fn();
            thread.createAnnotation('bleh');
            expect(thread.saveAnnotation).toBeCalledWith(TYPES.point, 'bleh');
        });
    });

    describe('regenerateBoundary()', () => {
        it('should do nothing if a valid location does not exist', () => {
            thread.location = undefined;
            thread.regenerateBoundary();

            thread.location = {};
            thread.regenerateBoundary();

            thread.location = { x: 'something' };
            thread.regenerateBoundary();

            thread.location = { y: 'something' };
            thread.regenerateBoundary();

            expect(thread.minX).toBeUndefined();
            expect(thread.minY).toBeUndefined();
        });

        it('should set the min/max x/y values to the thread location', () => {
            thread.location = { x: 1, y: 2 };
            thread.regenerateBoundary();
            expect(thread.minX).toEqual(1);
            expect(thread.minY).toEqual(2);
            expect(thread.maxX).toEqual(1);
            expect(thread.maxY).toEqual(2);
        });
    });

    describe('handleThreadSaveError()', () => {
        it('should delete temp annotation and emit event', () => {
            thread.deleteAnnotation = jest.fn();
            thread.handleThreadSaveError(new Error(), 1);
            expect(thread.deleteAnnotation).toBeCalledWith(1, false);
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.createError);
        });
    });
});
