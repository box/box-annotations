/* eslint-disable no-unused-expressions */
import * as ReactDOM from 'react-dom';

import AnnotationThread from '../AnnotationThread';
import * as util from '../util';
import {
    STATES,
    TYPES,
    CLASS_ANNOTATION_POINT_MARKER,
    DATA_TYPE_ANNOTATION_INDICATOR,
    THREAD_EVENT,
    CLASS_FLIPPED_POPOVER
} from '../constants';

let thread;
const html = '<div class="annotated-element"></div>';

describe('AnnotationThread', () => {
    let rootElement;

    let api = {
        user: {
            id: '1'
        }
    };

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        console.error = jest.fn(); // eslint-disable-line

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
        util.shouldDisplayMobileUI = jest.fn().mockReturnValue(false);
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
            expect(thread.unmountPopover).toBeCalled();
        });

        it('should remove thread element from DOM', () => {
            thread.element = document.createElement('div');
            rootElement.removeChild = jest.fn();
            rootElement.appendChild(thread.element);
            thread.destroy();
            expect(rootElement.removeChild).toBeCalled();
        });
    });

    describe('getPopoverParent()', () => {
        beforeEach(() => {
            thread.annotatedElement = 'annotatedElement';
            thread.container = 'container';
            util.getPageEl = jest.fn().mockReturnValue('pageEl');
        });

        it('should return the annotated element if no location or location page is set', () => {
            thread.location = undefined;
            expect(thread.getPopoverParent()).toEqual('annotatedElement');

            thread.location = {};
            expect(thread.getPopoverParent()).toEqual('annotatedElement');
        });

        it('should return container if user should see the mobile UI', () => {
            thread.location = { page: 1 };
            util.shouldDisplayMobileUI = jest.fn().mockReturnValue(true);
            expect(thread.getPopoverParent()).toEqual('container');
        });

        it('should return the page element if user should NOT see the mobile UI', () => {
            thread.location = { page: 1 };
            util.shouldDisplayMobileUI = jest.fn().mockReturnValue(false);
            expect(thread.getPopoverParent()).toEqual('pageEl');
        });
    });

    describe('unmountPopover', () => {
        beforeEach(() => {
            thread.popoverComponent = {};
            thread.reset = jest.fn();
            thread.toggleFlippedThreadEl = jest.fn();
            thread.container = {
                querySelectorAll: jest.fn().mockReturnValue([rootElement])
            };
        });

        it('should there are no popover layers', () => {
            thread.container = {
                querySelectorAll: jest.fn().mockReturnValue([])
            };
            thread.unmountPopover();
            expect(thread.popoverComponent).not.toBeNull();
            expect(thread.reset).toBeCalled();
            expect(thread.toggleFlippedThreadEl).toBeCalled();
        });

        it('should unmount any visible popovers', () => {
            thread.unmountPopover();
            expect(thread.popoverComponent).toBeNull();
            expect(thread.reset).toBeCalled();
            expect(thread.toggleFlippedThreadEl).toBeCalled();
        });
    });

    describe('renderAnnotationPopover()', () => {
        const event = {
            stopPropagation: jest.fn(),
            preventDefault: jest.fn()
        };

        it('should render and display the popover for this annotation', () => {
            thread.getPopoverParent = jest.fn().mockReturnValue(rootElement);
            util.getPopoverLayer = jest.fn().mockReturnValue(rootElement);
            util.shouldDisplayMobileUI = jest.fn().mockReturnValue(false);
            ReactDOM.render = jest.fn();
            thread.position = jest.fn();

            thread.renderAnnotationPopover(event);
            expect(thread.popoverComponent).not.toBeUndefined();
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
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
        it('should set the thread state to inactive if saved', () => {
            thread.reset();
            expect(thread.state).toEqual(STATES.inactive);
        });

        it('should set the thread state to pending if not saved', () => {
            thread.threadNumber = undefined;
            thread.reset();
            expect(thread.state).toEqual(STATES.pending);
        });
    });

    describe('save()', () => {
        beforeEach(() => {
            thread.getThreadEventData = jest.fn().mockReturnValue({});
            thread.handleThreadSaveError = jest.fn();
            thread.updateTemporaryAnnotation = jest.fn();
            thread.renderAnnotationPopover = jest.fn();
        });

        it('should save an annotation with the specified type and text', (done) => {
            thread.api.create = jest.fn().mockResolvedValue({});

            const promise = thread.save('point', 'blah');
            promise.then(() => {
                expect(thread.updateTemporaryAnnotation).toBeCalled();
                done();
            });
            expect(thread.api.create).toBeCalled();
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.create);
        });

        it('should delete the temporary annotation and broadcast an error if there was an error saving', (done) => {
            thread.api.create = jest.fn().mockRejectedValue({});

            const promise = thread.save('point', 'blah');
            promise.then(() => {
                expect(thread.handleThreadSaveError).toBeCalled();
                done();
            });
            expect(thread.api.create).toBeCalled();
            expect(thread.updateTemporaryAnnotation).not.toBeCalled();
        });
    });

    describe('updateAnnotationThread()', () => {
        beforeEach(() => {
            thread.threadNumber = '2';
            thread.comments = [];
            thread.createdAt = 'yesterday';
        });

        it('should update thread information if none was set', () => {
            thread.threadNumber = undefined;
            thread.updateAnnotationThread({
                id: '123',
                threadNumber: '1',
                threadID: 'abc',
                createdAt: 'today'
            });
            expect(thread.id).toEqual('123');
            expect(thread.threadNumber).toEqual('1');
            expect(thread.threadID).toEqual('abc');
            expect(thread.comments.length).toEqual(0);
            expect(thread.createdAt).toEqual('today');
        });

        it('should add a comment to the annotation', () => {
            thread.updateAnnotationThread({
                message: 'something'
            });
            expect(thread.comments.length).toEqual(1);
        });
    });

    describe('createAnnotationData()', () => {
        it('should create an annotation data object to post to the API', () => {
            const message = 'something';
            const type = 'point';
            const data = thread.createAnnotationData(type, message);
            expect(data).toStrictEqual({
                item: {
                    type: 'file_version',
                    id: '1'
                },
                details: {
                    type,
                    location: {},
                    threadID: '2'
                },
                message,
                createdBy: { id: '1' },
                thread: '1'
            });
        });
    });

    describe('updateTemporaryAnnotation()', () => {
        const tempAnnotation = { id: 1 };
        const serverAnnotation = {
            id: 456,
            threadNumber: 1,
            message: 'comment'
        };

        beforeEach(() => {
            thread.api.create = jest.fn();
            thread.getThreadEventData = jest.fn().mockReturnValue({});
            thread.renderAnnotationPopover = jest.fn();
            thread.comments = [tempAnnotation];
        });

        it('should save annotation to thread if it does not exist in annotations array', () => {
            thread.updateTemporaryAnnotation(tempAnnotation.id, serverAnnotation);
            expect(thread.comments).toContain(serverAnnotation);
        });

        it('should overwrite a local annotation to the thread if it does exist as an associated annotation', () => {
            thread.updateTemporaryAnnotation(tempAnnotation.id, serverAnnotation);
            expect(thread.comments).not.toContain(tempAnnotation);
            expect(thread.comments).toContain(serverAnnotation);
        });

        it('should emit an annotationsaved event on success', () => {
            thread.threadNumber = undefined;
            thread.updateTemporaryAnnotation(tempAnnotation.id, serverAnnotation);
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.save);
        });

        it('should only render popover on desktop', () => {
            thread.updateTemporaryAnnotation(tempAnnotation.id, serverAnnotation);
            expect(thread.renderAnnotationPopover).toBeCalled();
            expect(thread.state).toEqual(STATES.inactive);
        });

        it('should only render popover on mobile', () => {
            util.shouldDisplayMobileUI = jest.fn().mockReturnValue(true);
            thread.updateTemporaryAnnotation(tempAnnotation.id, serverAnnotation);
            expect(thread.state).toEqual(STATES.active);
            expect(thread.renderAnnotationPopover).toBeCalled();
        });
    });

    describe('delete()', () => {
        let annotation;

        beforeEach(() => {
            api = {
                user: { id: 1 },
                delete: jest.fn().mockResolvedValue()
            };

            annotation = {
                id: 'someID',
                permissions: {
                    can_delete: true
                },
                threadID: 1
            };

            thread.api = api;
            thread.comments = [annotation];
            util.isPlainHighlight = jest.fn();
            thread.cancelFirstComment = jest.fn();
            thread.destroy = jest.fn();
            thread.deleteSuccessHandler = jest.fn().mockResolvedValue();
            thread.renderAnnotationPopover = jest.fn();
            thread.cleanupAnnotationOnDelete = jest.fn();
            thread.getThreadEventData = jest.fn().mockReturnValue({
                threadNumber: 1
            });
            thread.emit = jest.fn();
        });

        it('should cleanup the annotation on delete successfully and delete from the specified annotation from the server', () => {
            thread.delete({ id: 'someID' }).then(() => {
                expect(thread.api.delete).toBeCalledWith('someID');
                expect(thread.cleanupAnnotationOnDelete).toBeCalled();
                expect(thread.deleteSuccessHandler).toBeCalled();
            });
        });

        it('should error if no annotation was found in thread', () => {
            thread.comments = [];
            thread.delete({ id: 'someID' }).catch(() => {
                expect(api.delete).not.toBeCalled();
                expect(console.error).toBeCalled(); // eslint-disable-line
            });
        });

        it('should not delete annotation if user does not have permissions to delete', () => {
            annotation.permissions.can_delete = false;
            thread.delete({ id: 'someID' }).catch(() => {
                expect(api.delete).not.toBeCalled();
                expect(console.error).toBeCalled(); // eslint-disable-line
            });
        });

        it('should not make a server call to delete an annotation with the specified ID if useServer is false', () => {
            thread.delete({ id: 'someID' }, false).then(() => {
                expect(api.delete).not.toBeCalled();
                expect(console.error).toBeCalled(); // eslint-disable-line
            });
        });

        it('should broadcast an error if there was an error deleting from server', () => {
            api.delete = jest.fn().mockRejectedValue();
            thread.api = api;

            thread.delete({ id: 'someID' }).catch(() => {
                expect(api.delete).toBeCalled();
            });
        });
    });

    describe('cleanupAnnotationOnDelete()', () => {
        let comment;
        beforeEach(() => {
            comment = {
                id: '123'
            };
            thread.comments = [comment];
            thread.threadID = '123abc';
            thread.renderAnnotationPopover = jest.fn();
            thread.canDelete = false;
        });

        it('should delete the appropriate comment', () => {
            thread.cleanupAnnotationOnDelete(comment.id);
            expect(thread.comments.length).toEqual(0);
        });

        it('should not destroy the thread if the user does not have canDelete permissions', () => {
            thread.cleanupAnnotationOnDelete(comment.id);
            expect(thread.threadID).not.toBeNull();
        });

        it('should destroy the the thread if the comment was the last one in the annotation', () => {
            thread.canDelete = true;
            thread.cleanupAnnotationOnDelete(comment.id);
            expect(thread.threadID).toBeNull();
        });

        it('should re-render the popover if the comment was NOTthe last one in the annotation', () => {
            thread.cleanupAnnotationOnDelete(comment.id);
            expect(thread.threadID).not.toBeNull();
            expect(thread.renderAnnotationPopover).toBeCalled();
        });
    });

    describe('deleteSuccessHandler()', () => {
        beforeEach(() => {
            thread.renderAnnotationPopover = jest.fn();
            thread.destroy = jest.fn();
            thread.emit = jest.fn();
        });

        it('should re-render the popover if the thread is still valid', () => {
            thread.threadID = '123';
            thread.deleteSuccessHandler();
            expect(thread.renderAnnotationPopover).toBeCalled();
            expect(thread.emit).not.toBeCalledWith(THREAD_EVENT.delete);
            expect(thread.destroy).not.toBeCalled();
        });

        it('should emit that an annotation comment has been deleted', () => {
            thread.threadID = '123';
            thread.deleteSuccessHandler();
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.deleteComment);
        });

        it('should properly destroy the thread if the thread should be completely deleted', () => {
            thread.threadID = null;
            thread.deleteSuccessHandler();
            expect(thread.renderAnnotationPopover).not.toBeCalled();
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.delete);
            expect(thread.destroy).toBeCalled();
        });
    });

    describe('deleteErrorHandler()', () => {
        it('should re-render and broadcast delete error message', () => {
            const error = {
                toString: jest.fn().mockReturnValue('error')
            };
            thread.deleteErrorHandler(error);
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.render, thread.location);
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.deleteError);
            expect(console.error).toBeCalledWith(THREAD_EVENT.deleteError, 'error'); // eslint-disable-line
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
        let pageEl;
        beforeEach(() => {
            pageEl = {
                scrollIntoView: jest.fn()
            };
            util.getPageEl = jest.fn().mockReturnValue(pageEl);
        });

        it('should do nothing if annotation does not have a location or page', () => {
            thread.location = {};
            thread.scrollToPage();

            thread.location = null;
            thread.scrollToPage();
            expect(pageEl.scrollIntoView).not.toBeCalled();
        });

        it('should scroll annotation\'s page into view', () => {
            thread.location = {
                page: 1
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
        });

        it('should set state to pending for unsaved annotations', () => {
            thread.threadNumber = undefined;
            thread.setup();
            expect(thread.state).toEqual(STATES.pending);
        });

        it('should set state to inactive for saved annotations', () => {
            thread.threadNumber = 1;
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
        });

        it('should bind DOM listeners', () => {
            thread.bindDOMListeners();
            expect(thread.element.addEventListener).toBeCalledWith('click', expect.any(Function));
        });

        it('should not add mouseleave listener for mobile browsers', () => {
            util.shouldDisplayMobileUI = jest.fn().mockReturnValue(true);
            thread.bindDOMListeners();
            expect(thread.element.addEventListener).toBeCalledWith('click', expect.any(Function));
        });
    });

    describe('unbindDOMListeners()', () => {
        beforeEach(() => {
            thread.element = document.createElement('div');
            thread.element.removeEventListener = jest.fn();
        });

        it('should unbind DOM listeners', () => {
            thread.unbindDOMListeners();
            expect(thread.element.removeEventListener).toBeCalledWith('click', expect.any(Function));
        });

        it('should not add mouseleave listener for mobile browsers', () => {
            util.shouldDisplayMobileUI = jest.fn().mockReturnValue(true);
            thread.unbindDOMListeners();
            expect(thread.element.removeEventListener).toBeCalledWith('click', expect.any(Function));
        });
    });

    describe('cancelUnsavedAnnotation()', () => {
        beforeEach(() => {
            thread.destroy = jest.fn();
            thread.unmountPopover = jest.fn();
        });

        it('should destroy thread if in a pending state', () => {
            thread.state = STATES.pending;
            thread.cancelUnsavedAnnotation();
            expect(thread.destroy).toBeCalled();
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.cancel);
            expect(thread.unmountPopover).not.toBeCalled();
        });

        it('should not destroy thread if not in a pending state', () => {
            thread.state = STATES.inactive;
            thread.cancelUnsavedAnnotation();
            expect(thread.destroy).not.toBeCalled();
            expect(thread.emit).not.toBeCalledWith(THREAD_EVENT.cancel);
            expect(thread.unmountPopover).toBeCalled();
        });
    });

    describe('getThreadEventData()', () => {
        it('should return thread type and threadID', () => {
            thread.api.user = {
                id: -1
            };
            thread.threadNumber = undefined;
            const data = thread.getThreadEventData();
            expect(data).toStrictEqual({
                type: thread.type,
                threadID: thread.threadID
            });
        });

        it('should also return annotator\'s user id', () => {
            thread.api.user = {
                id: 1
            };
            thread.threadNumber = undefined;
            const data = thread.getThreadEventData();
            expect(data).toStrictEqual({
                type: thread.type,
                threadID: thread.threadID,
                userId: 1
            });
        });

        it('should return thread type and threadID', () => {
            thread.api.user = {
                id: -1
            };
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
            thread.save = jest.fn();
            thread.createAnnotation('bleh');
            expect(thread.save).toBeCalledWith(TYPES.point, 'bleh');
        });
    });

    describe('regenerateBoundary()', () => {
        it('should do nothing if a valid location does not exist', () => {
            thread.location = undefined;
            thread.regenerateBoundary();

            thread.location = {};
            thread.regenerateBoundary();

            thread.location = {
                x: 'something'
            };
            thread.regenerateBoundary();

            thread.location = {
                y: 'something'
            };
            thread.regenerateBoundary();

            expect(thread.minX).toBeUndefined();
            expect(thread.minY).toBeUndefined();
        });

        it('should set the min/max x/y values to the thread location', () => {
            thread.location = {
                x: 1,
                y: 2
            };
            thread.regenerateBoundary();
            expect(thread.minX).toEqual(1);
            expect(thread.minY).toEqual(2);
            expect(thread.maxX).toEqual(1);
            expect(thread.maxY).toEqual(2);
        });
    });

    describe('handleThreadSaveError()', () => {
        it('should delete temp annotation and emit event', () => {
            thread.delete = jest.fn();
            thread.handleThreadSaveError(new Error(), 1);
            expect(thread.delete).toBeCalledWith({ id: 1 }, false);
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.createError);
        });
    });

    describe('toggleFlippedThreadEl()', () => {
        it('should do nothing if annotation has no associated element', () => {
            thread.element = document.createElement('div');
            thread.element.classList.add(CLASS_FLIPPED_POPOVER);
            thread.toggleFlippedThreadEl();
            expect(thread.element.classList).not.toContain(CLASS_FLIPPED_POPOVER);
        });
    });
});
