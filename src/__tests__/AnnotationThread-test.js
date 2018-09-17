/* eslint-disable no-unused-expressions */
import AnnotationThread from '../AnnotationThread';
import * as util from '../util';
import {
    STATES,
    TYPES,
    CLASS_ANNOTATION_POINT_MARKER,
    DATA_TYPE_ANNOTATION_INDICATOR,
    CLASS_HIDDEN,
    THREAD_EVENT,
    SELECTOR_ANNOTATED_ELEMENT
} from '../constants';

let thread;
const html = '<div class="annotated-element"></div>';

describe('AnnotationThread', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        thread = new AnnotationThread({
            annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
            annotations: [],
            annotationService: { user: { id: '1' } },
            fileVersionId: '1',
            isMobile: false,
            location: {},
            threadID: '2',
            threadNumber: '1',
            type: 'point'
        });

        thread.dialog = {
            activateReply: jest.fn(),
            addListener: jest.fn(),
            annotations: [],
            destroy: jest.fn(),
            setup: jest.fn(),
            removeAllListeners: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
            scrollToLastComment: jest.fn()
        };

        thread.emit = jest.fn();
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        thread = null;
    });

    describe('destroy()', () => {
        beforeEach(() => {
            thread.state = STATES.pending;
            thread.unbindCustomListenersOnDialog = jest.fn();
            thread.unbindDOMListeners = jest.fn();
        });

        it('should unbind listeners and remove thread element and broadcast that the thread was deleted', () => {
            thread.destroy();
            expect(thread.unbindCustomListenersOnDialog).toBeCalled();
            expect(thread.unbindDOMListeners).toBeCalled();
            expect(thread.emit).not.toBeCalledWith(THREAD_EVENT.threadDelete);
        });

        it('should emit annotationthreaddeleted only if thread is not in a pending state', () => {
            thread.state = STATES.inactive;
            thread.destroy();
            expect(thread.unbindCustomListenersOnDialog).toBeCalled();
            expect(thread.unbindDOMListeners).toBeCalled();
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.threadDelete);
        });

        it('should not destroy the dialog on mobile', () => {
            thread.element = null;
            thread.isMobile = true;

            thread.destroy();
            expect(thread.unbindCustomListenersOnDialog).not.toBeCalled();
            expect(thread.dialog.destroy).not.toBeCalled();
        });
    });

    describe('hide()', () => {
        it('should hide the thread element', () => {
            thread.hide();
            expect(thread.element.classList).toContain(CLASS_HIDDEN);
        });
    });

    describe('reset()', () => {
        it('should set the thread state to inactive', () => {
            thread.reset();
            expect(thread.state).toEqual(STATES.inactive);
        });
    });

    describe('isDialogVisible()', () => {
        beforeEach(() => {
            thread.dialog = {
                element: document.createElement('div')
            };
        });

        it('returns true if thread\'s dialog is visible', () => {
            expect(thread.isDialogVisible()).toBeTruthy();
        });

        it('returns false if thread\'s dialog is hidden', () => {
            thread.dialog.element.classList.add(CLASS_HIDDEN);
            expect(thread.isDialogVisible()).toBeFalsy();
        });
    });

    describe('showDialog()', () => {
        it('should setup the thread dialog if the dialog element does not already exist', () => {
            thread.dialog.element = null;
            thread.showDialog();
            expect(thread.dialog.setup).toBeCalled();
            expect(thread.dialog.show).toBeCalled();
        });

        it('should not setup the thread dialog if the dialog element already exists', () => {
            thread.dialog.element = {};
            thread.showDialog();
            expect(thread.dialog.setup).not.toBeCalled();
            expect(thread.dialog.show).toBeCalled();
        });
    });

    describe('hideDialog()', () => {
        it('should hide the thread dialog', () => {
            thread.hideDialog();
            expect(thread.state).toEqual(STATES.inactive);
            expect(thread.dialog.hide).toBeCalled();
        });
    });

    describe('saveAnnotation()', () => {
        beforeEach(() => {
            thread.getThreadEventData = jest.fn().mockReturnValue({});
            thread.annotationService.create = jest.fn();
            thread.handleThreadSaveError = jest.fn();
            thread.updateTemporaryAnnotation = jest.fn();
        });

        it('should save an annotation with the specified type and text', (done) => {
            thread.annotationService.create = jest.fn().mockResolvedValue({});

            const promise = thread.saveAnnotation('point', 'blah');
            promise.then(() => {
                expect(thread.updateTemporaryAnnotation).toBeCalled();
                done();
            });
            expect(thread.annotationService.create).toBeCalled();
        });

        it('should delete the temporary annotation and broadcast an error if there was an error saving', (done) => {
            thread.annotationService.create = jest.fn().mockRejectedValue({});

            const promise = thread.saveAnnotation('point', 'blah');
            promise.then(() => {
                expect(thread.handleThreadSaveError).toBeCalled();
                done();
            });
            expect(thread.annotationService.create).toBeCalled();
            expect(thread.updateTemporaryAnnotation).not.toBeCalled();
        });
    });

    describe('updateTemporaryAnnotation()', () => {
        beforeEach(() => {
            thread.annotationService.create = jest.fn();
            thread.getThreadEventData = jest.fn().mockReturnValue({});
        });

        it('should save annotation to thread if it does not exist in annotations array', () => {
            const serverAnnotation = 'real annotation';
            const tempAnnotation = serverAnnotation;
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.annotations).toContain(serverAnnotation);
        });

        it('should overwrite a local annotation to the thread if it does exist as an associated annotation', () => {
            const serverAnnotation = { id: 123 };
            const tempAnnotation = { id: 1 };

            thread.annotations.push(tempAnnotation);
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.annotations).not.toContain(tempAnnotation);
            expect(thread.annotations).toContain(serverAnnotation);
        });

        it('should emit an annotationsaved event on success', () => {
            const serverAnnotation = { threadNumber: 1 };
            const tempAnnotation = serverAnnotation;
            thread.threadNumber = undefined;
            thread.emit = jest.fn();

            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.save);
        });

        it('should update thread number and replace temporary annotation if dialog exists', () => {
            const serverAnnotation = { id: 123 };
            const tempAnnotation = { id: 1 };
            thread.threadNumber = 'something';
            thread.dialog.element = document.createElement('div');

            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.dialog.element.dataset.threadNumber).not.toBeUndefined();
            expect(thread.dialog.show).toBeCalledWith([serverAnnotation]);
            expect(thread.dialog.scrollToLastComment).toBeCalled();
        });

        it('should only show dialog immediately on mobile devices', () => {
            const serverAnnotation = { threadNumber: 1 };
            const tempAnnotation = serverAnnotation;
            thread.showDialog = jest.fn();

            // Don't show dialog on web browsers
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.showDialog).not.toBeCalled();
            expect(thread.state).not.toEqual(STATES.hover);

            // Only show dialog on mobile browsers
            thread.isMobile = true;
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.showDialog).toBeCalled();
            expect(thread.state).toEqual(STATES.hover);
        });
    });

    describe('deleteAnnotation()', () => {
        let annotationService;
        let annotation;
        let annotation2;
        const threadPromise = Promise.resolve();

        beforeEach(() => {
            annotationService = {
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

            thread = new AnnotationThread({
                annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
                annotations: [annotation],
                annotationService,
                fileVersionId: '1',
                isMobile: false,
                location: {},
                threadID: '2',
                threadNumber: '1',
                type: 'point'
            });

            thread.dialog = {
                addListener: jest.fn(),
                activateReply: jest.fn(),
                annotations: [annotation],
                destroy: jest.fn(),
                removeAllListeners: jest.fn(),
                show: jest.fn(),
                hide: jest.fn(),
                hideMobileDialog: jest.fn(),
                setup: jest.fn()
            };

            util.isPlainHighlight = jest.fn();
            thread.cancelFirstComment = jest.fn();
            thread.destroy = jest.fn();
            thread.showDialog = jest.fn();
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
                    expect(thread.dialog.show).not.toBeCalled();
                    expect(thread.dialog.hideMobileDialog).not.toBeCalled();
                    done();
                });
            });
        });

        it('should destroy the thread and hide the mobile dialog if the deleted annotation was the last annotation in the thread on mobile', (done) => {
            thread.isMobile = true;

            const promise = thread.deleteAnnotation('someID', false);
            promise.then(() => {
                expect(thread.dialog.show).toBeCalled();
                expect(thread.dialog.hideMobileDialog).toBeCalled();
                done();
            });
        });

        it('should remove the relevant annotation from its dialog if the deleted annotation was not the last one', (done) => {
            thread.annotations.push(annotation2);
            const promise = thread.deleteAnnotation('someID', false);
            promise.then(() => {
                expect(thread.dialog.show).toBeCalledWith([annotation2]);
                expect(thread.dialog.activateReply).toBeCalled();
                done();
            });
        });

        it('should make a server call to delete an annotation with the specified ID if useServer is true', (done) => {
            thread.annotations.push(annotation2);
            const promise = thread.deleteAnnotation('someID', true);
            promise.then(() => {
                expect(thread.emit).not.toBeCalledWith(THREAD_EVENT.threadCleanup);
                expect(annotationService.delete).toBeCalledWith('someID');
                done();
            });
        });

        it('should also delete blank highlight comment from the server when removing the last comment on a highlight thread', (done) => {
            annotation2.permissions.can_delete = false;
            thread.annotations.push(annotation2);
            util.isPlain = jest.fn().mockReturnValue(true);

            const promise = thread.deleteAnnotation('someID', true);
            promise.then(() => {
                expect(annotationService.delete).toBeCalledWith('someID');
                done();
            });
        });

        it('should not make a server call to delete an annotation with the specified ID if useServer is false', (done) => {
            const promise = thread.deleteAnnotation('someID', false);
            promise.then(() => {
                expect(annotationService.delete).not.toBeCalled();
                done();
            });
        });

        it('should broadcast an error if there was an error deleting from server', (done) => {
            annotationService.delete = jest.fn().mockRejectedValue();

            const promise = thread.deleteAnnotation('someID', true);
            promise.catch(() => {
                expect(annotationService.delete).toBeCalled();
                done();
            });
        });

        it('should toggle highlight dialogs with the delete of the last comment if user does not have permission to delete the entire annotation', () => {
            thread.annotations.push(annotation2);
            util.isPlain = jest.fn().mockReturnValue(true);

            const promise = thread.deleteAnnotation('someID');
            promise.then(() => {
                expect(thread.cancelFirstComment).toBeCalled();
                expect(thread.destroy).not.toBeCalled();
            });
        });

        it('should destroy the annotation with the delete of the last comment if the user has permissions', () => {
            annotation2.permissions.can_delete = true;
            thread.annotations.push(annotation2);
            util.isPlain = jest.fn().mockReturnValue(true);

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
            thread.createDialog = jest.fn();
            thread.bindCustomListenersOnDialog = jest.fn();
            thread.setupElement = jest.fn();
            thread.destroy = jest.fn();
        });

        it('should setup dialog', () => {
            thread.dialog = {};
            thread.setup();
            expect(thread.createDialog).toBeCalled();
            expect(thread.bindCustomListenersOnDialog).toBeCalled();
            expect(thread.setupElement).toBeCalled();
            expect(thread.dialog.isMobile).toEqual(thread.isMobile);
        });

        it('should set state to pending if thread is initialized with no annotations', () => {
            thread.setup();
            expect(thread.state).toEqual(STATES.pending);
        });

        it('should set state to inactive if thread is initialized with annotations', () => {
            thread = new AnnotationThread({
                annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
                annotations: [{}],
                annotationService: {},
                fileVersionId: '1',
                isMobile: false,
                location: {},
                threadID: '2',
                threadNumber: '1',
                type: 'point'
            });
            thread.destroy = jest.fn();

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

    describe('bindCustomListenersOnDialog()', () => {
        it('should bind custom listeners on dialog', () => {
            thread.bindCustomListenersOnDialog();
            expect(thread.dialog.addListener).toBeCalledWith('annotationcreate', expect.any(Function));
            expect(thread.dialog.addListener).toBeCalledWith('annotationcancel', expect.any(Function));
            expect(thread.dialog.addListener).toBeCalledWith('annotationdelete', expect.any(Function));
            expect(thread.dialog.addListener).toBeCalledWith('annotationshow', expect.any(Function));
            expect(thread.dialog.addListener).toBeCalledWith('annotationhide', expect.any(Function));
        });
    });

    describe('unbindCustomListenersOnDialog()', () => {
        it('should unbind custom listeners from dialog', () => {
            thread.unbindCustomListenersOnDialog();
            expect(thread.dialog.removeAllListeners).toBeCalledWith([
                'annotationcreate',
                'annotationcancel',
                'annotationdelete',
                'annotationshow',
                'annotationhide'
            ]);
        });
    });

    describe('cancelUnsavedAnnotation()', () => {
        beforeEach(() => {
            thread.destroy = jest.fn();
            thread.hideDialog = jest.fn();
        });

        it('should destroy thread if in a pending/pending-active state', () => {
            util.isPending = jest.fn().mockReturnValue(true);
            thread.cancelUnsavedAnnotation();
            expect(thread.destroy).toBeCalled();
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.cancel);
            expect(thread.hideDialog).not.toBeCalled();
        });

        it('should not destroy thread if not in a pending/pending-active state', () => {
            util.isPending = jest.fn().mockReturnValue(false);
            thread.cancelUnsavedAnnotation();
            expect(thread.destroy).not.toBeCalled();
            expect(thread.emit).not.toBeCalledWith(THREAD_EVENT.cancel);
            expect(thread.hideDialog).toBeCalled();
        });
    });

    describe('getThreadEventData()', () => {
        it('should return thread type and threadID', () => {
            thread.annotationService.user = { id: -1 };
            thread.threadNumber = undefined;
            const data = thread.getThreadEventData();
            expect(data).toStrictEqual({
                type: thread.type,
                threadID: thread.threadID
            });
        });

        it('should also return annotator\'s user id', () => {
            thread.annotationService.user = { id: 1 };
            thread.threadNumber = undefined;
            const data = thread.getThreadEventData();
            expect(data).toStrictEqual({
                type: thread.type,
                threadID: thread.threadID,
                userId: 1
            });
        });

        it('should return thread type and threadID', () => {
            thread.annotationService.user = { id: -1 };
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

    describe('createAnnotationDialog()', () => {
        it('should correctly create the annotation data object', () => {
            const annotationData = thread.createAnnotationData('highlight', 'test');
            expect(annotationData.location).toEqual(thread.location);
            expect(annotationData.fileVersionId).toEqual(thread.fileVersionId);
            expect(annotationData.thread).toEqual(thread.thread);
            expect(annotationData.createdBy.id).toEqual('1');
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
