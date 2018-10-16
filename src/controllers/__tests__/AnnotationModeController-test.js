/* eslint-disable no-unused-expressions */
import rbush from 'rbush';
import AnnotationModeController from '../AnnotationModeController';
import * as util from '../../util';
import {
    CLASS_HIDDEN,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    CLASS_ANNNOTATION_MODE_BACKGROUND,
    SELECTOR_BOX_PREVIEW_BASE_HEADER,
    THREAD_EVENT,
    STATES,
    CONTROLLER_EVENT
} from '../../constants';

let controller;
let thread;

const api = {
    addListener: jest.fn(),
    removeListener: jest.fn()
};

const html = `<div class="annotated-element">
  <div data-page-number="1"></div>
  <div data-page-number="2"></div>
</div>`;

describe('controllers/AnnotationModeController', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        controller = new AnnotationModeController();
        controller.container = document;
        thread = {
            annotatedElement: rootElement,
            threadID: '123abc',
            location: { page: 1 },
            type: 'type',
            state: STATES.pending,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            saveAnnotation: jest.fn(),
            handleStart: jest.fn(),
            destroy: jest.fn(),
            deleteThread: jest.fn(),
            isDialogVisible: jest.fn(),
            unmountPopover: jest.fn(),
            renderAnnotationPopover: jest.fn(),
            show: jest.fn(),
            minX: 1,
            minY: 2,
            maxX: 1,
            maxY: 2
        };
        controller.getLocation = jest.fn();
        controller.annotatedElement = rootElement;
        controller.permissions = {
            can_annotate: true
        };
    });

    afterEach(() => {
        controller = null;
    });

    describe('init()', () => {
        it('should init controller', () => {
            controller.showButton = jest.fn();
            controller.init({
                modeButton: {},
                permissions: { can_annotate: true },
                localized: { anonymousUserName: '' }
            });
            expect(controller.showButton).toBeCalled();
        });

        it('should not show modeButton if none provided', () => {
            controller.showButton = jest.fn();
            controller.init({
                localized: { anonymousUserName: '' }
            });
            expect(controller.showButton).not.toBeCalled();
        });

        it('should not show modeButton if none provided', () => {
            controller.showButton = jest.fn();
            controller.init({
                modeButton: {},
                permissions: { can_annotate: false },
                localized: { anonymousUserName: '' }
            });
            expect(controller.showButton).not.toBeCalled();
        });
    });

    describe('After init', () => {
        beforeEach(() => {
            controller.api = api;
            controller.localized = {
                anonymouseUserName: ''
            };
        });

        describe('destroy()', () => {
            it('should destroy all the threads in controller', () => {
                controller.destroy();
                expect(controller.buttonEl).toBeUndefined();
            });

            it('should hide the button if modeButton exists', () => {
                controller.modeButton = {};
                controller.hideButton = jest.fn();
                controller.destroy();
                expect(controller.hideButton).toBeCalled();
            });

            it('should not hide the button if modeButton does not exist', () => {
                controller.modeButton = undefined;
                controller.hideButton = jest.fn();
                controller.destroy();
                expect(controller.hideButton).not.toBeCalled();
            });
        });

        describe('getButton()', () => {
            it('should return the annotation mode button', () => {
                const buttonEl = document.createElement('button');
                buttonEl.classList.add('class');
                controller.headerElement = document.createElement('div');
                controller.headerElement.appendChild(buttonEl);
            });

            it('should return null if no headerElement', () => {
                expect(controller.getButton('.class')).toBeNull();
            });
        });

        describe('showButton()', () => {
            let buttonEl;

            beforeEach(() => {
                controller.modeButton = {
                    type: {
                        title: 'Annotation Mode',
                        selector: '.selector'
                    }
                };
                buttonEl = document.createElement('button');
                buttonEl.title = controller.modeButton.title;
                buttonEl.classList.add(CLASS_HIDDEN);
                buttonEl.classList.add('selector');
                buttonEl.addEventListener = jest.fn();

                controller.permissions = { can_annotate: true };
                controller.getButton = jest.fn().mockReturnValue(buttonEl);
            });

            it('should do nothing if the button is not in the container', () => {
                controller.getButton = jest.fn();
                controller.showButton();
                expect(buttonEl.classList).toContain(CLASS_HIDDEN);
            });

            it('should set up and show an annotate button', () => {
                controller.showButton();
                expect(buttonEl.classList).not.toContain(CLASS_HIDDEN);
                expect(buttonEl.addEventListener).toBeCalledWith('click', controller.toggleMode);
            });
        });

        describe('hideButton()', () => {
            let buttonEl;

            beforeEach(() => {
                controller.modeButton = {
                    type: {
                        title: 'Annotation Mode',
                        selector: '.selector'
                    }
                };
                buttonEl = document.createElement('button');
                buttonEl.title = controller.modeButton.title;
                // buttonEl.classList.add(CLASS_HIDDEN);
                buttonEl.classList.add('selector');
                buttonEl.addEventListener = jest.fn();

                controller.permissions = { can_annotate: true };
                controller.getButton = jest.fn().mockReturnValue(buttonEl);
            });

            it('should do nothing if user cannot annotate', () => {
                controller.permissions.can_annotate = false;
                controller.hideButton();
                expect(buttonEl.classList).not.toContain(CLASS_HIDDEN);
            });

            it('should do nothing if button is not found', () => {
                controller.getButton = jest.fn();
                controller.hideButton();
                expect(buttonEl.classList).not.toContain(CLASS_HIDDEN);
            });

            it('should add the bp-is-hidden class to the button', () => {
                controller.hideButton();
                expect(buttonEl.classList).toContain(CLASS_HIDDEN);
            });

            it('should do nothing if no modeButton', () => {
                controller.modeButton = undefined;
                controller.permissions.can_annotate = false;
                controller.hideButton();
                expect(buttonEl.classList).not.toContain(CLASS_HIDDEN);
            });
        });

        describe('toggleMode()', () => {
            beforeEach(() => {
                controller.emit = jest.fn();
                controller.destroyPendingThreads = jest.fn();
            });

            it('should destroy all threads', () => {
                controller.modeButton = undefined;
                controller.toggleMode();
                expect(controller.emit).not.toBeCalledWith(CONTROLLER_EVENT.toggleMode);
            });

            it('should only toggle the current annotation mode if it has a button', () => {
                controller.modeButton = {};
                controller.toggleMode();
                expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.toggleMode);
            });
        });

        describe('exit()', () => {
            it('should exit annotation mode', () => {
                controller.unbindListeners = jest.fn();
                controller.emit = jest.fn();
                util.replaceHeader = jest.fn();

                // Set up annotation mode
                controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);
                controller.annotatedElement.classList.add(CLASS_ANNNOTATION_MODE_BACKGROUND);
                controller.headerElement = document.createElement('div');

                controller.buttonEl = document.createElement('button');
                controller.buttonEl.classList.add(CLASS_ACTIVE);

                controller.exit();
                expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.exit, expect.any(Object));
                expect(controller.unbindListeners).toBeCalled();
                expect(controller.emit).toBeCalledWith('binddomlisteners');
                expect(util.replaceHeader).toBeCalledWith(controller.headerElement, SELECTOR_BOX_PREVIEW_BASE_HEADER);
            });
        });

        describe('enter()', () => {
            it('should exit annotation mode', () => {
                controller.bindListeners = jest.fn();
                controller.emit = jest.fn();

                // Set up annotation mode
                controller.buttonEl = document.createElement('button');

                controller.enter();
                expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.enter, expect.any(Object));
                expect(controller.bindListeners).toBeCalled();
                expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.unbindDOMListeners);
            });
        });

        describe('isEnabled()', () => {
            it('should return whether or not the current annotation mode is enabled', () => {
                controller.buttonEl = document.createElement('button');
                expect(controller.isEnabled()).toBeFalsy();

                controller.buttonEl.classList.add(CLASS_ACTIVE);
                expect(controller.isEnabled()).toBeTruthy();
            });
        });

        describe('bindListeners()', () => {
            it('should bind mode listeners', () => {
                const handlerObj = {
                    type: 'event',
                    func: jest.fn(),
                    useCapture: false,
                    eventObj: {
                        addEventListener: jest.fn()
                    }
                };
                controller.setupHandlers = jest.fn(() => {
                    controller.handlers = [handlerObj];
                });
                expect(controller.handlers.length).toEqual(0);

                controller.bindListeners();
                expect(handlerObj.eventObj.addEventListener).toBeCalledWith(handlerObj.type, handlerObj.func, false);
                expect(controller.handlers).toContain(handlerObj);
            });
        });

        describe('unbindListeners()', () => {
            it('should unbind mode listeners', () => {
                const handlerObj = {
                    type: 'event',
                    func: jest.fn(),
                    useCapture: false,
                    eventObj: {
                        removeEventListener: jest.fn()
                    }
                };

                controller.handlers = [handlerObj];
                expect(controller.handlers.length).toEqual(1);

                controller.unbindListeners();
                expect(handlerObj.eventObj.removeEventListener).toBeCalledWith(handlerObj.type, handlerObj.func, false);
                expect(controller.handlers).toEqual([]);
            });
        });

        describe('registerThread()', () => {
            beforeEach(() => {
                controller.emit = jest.fn();
                controller.threads = {};
                controller.getThreadParams = jest.fn().mockReturnValue({});
                controller.instantiateThread = jest.fn();
            });

            it('should do nothing if thread has invalid params', () => {
                controller.getThreadParams = jest.fn();
                controller.registerThread([], {}, 'someType');
                expect(controller.emit).not.toBeCalled();
            });

            it('should do nothing if thread has invalid boundary', () => {
                controller.registerThread([], { minX: NaN, minY: 1, maxX: 1, maxY: 1 }, thread.type);
                expect(controller.emit).not.toBeCalled();
            });

            it('should create a new rbush for the thread\'s page location', () => {
                controller.instantiateThread = jest.fn().mockReturnValue(thread);
                controller.registerThread([], thread.location, thread.type);
                expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.register, thread);
                expect(thread.addListener).toBeCalledWith('threadevent', expect.any(Function));
            });

            it('should internally keep track of the registered thread', () => {
                controller.instantiateThread = jest.fn().mockReturnValue(thread);
                controller.registerThread([], thread.location, thread.type);
                expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.register, thread);
                expect(thread.addListener).toBeCalledWith('threadevent', expect.any(Function));
            });
        });

        describe('unregisterThread()', () => {
            beforeEach(() => {
                controller.emit = jest.fn();
                controller.threads = {};
            });

            it('should do nothing if thread does not have location', () => {
                controller.unregisterThread();
                controller.unregisterThread({ type: 'someType' });
                controller.unregisterThread({ location: 'noPage' });
                expect(controller.emit).not.toBeCalled();
            });

            it('should internally keep track of the registered thread', () => {
                // eslint-disable-next-line new-cap
                const pageThreads = {
                    all: jest.fn().mockReturnValue([thread]),
                    remove: jest.fn()
                };

                controller.threads = { 1: pageThreads };

                controller.unregisterThread(thread);
                expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.unregister, thread);
                expect(thread.removeListener).toBeCalledWith('threadevent', expect.any(Function));
            });
        });

        describe('applyActionToPageThreads()', () => {
            it('should apply the predicate function to all of the controller\'s threads on the specified page', () => {
                controller.threads = {
                    1: { all: jest.fn().mockReturnValue([thread]) }
                };
                controller.applyActionToPageThreads(thread.addListener, 2); // func not called
                controller.applyActionToPageThreads(thread.addListener, 1);
                expect(thread.addListener).toHaveBeenCalled();
            });
        });

        describe('applyActionToThreads()', () => {
            it('should apply the predicate function to all of the controller\'s threads', () => {
                controller.threads = {
                    1: { all: jest.fn().mockReturnValue([thread]) },
                    2: { all: jest.fn().mockReturnValue([thread]) }
                };
                controller.applyActionToThreads(thread.addListener);
                expect(thread.addListener).toHaveBeenCalledTimes(2);
            });
        });

        describe('getThreadByID()', () => {
            it('should return null if no page threads exist', () => {
                controller.threads = {
                    1: {
                        all: jest.fn().mockReturnValue([])
                    }
                };
                expect(controller.getThreadByID(thread.threadID)).toBeNull();
            });

            it('should find and return annotation thread specified by threadID', () => {
                controller.threads = {
                    1: {
                        all: jest.fn().mockReturnValue([thread])
                    }
                };
                expect(controller.getThreadByID(thread.threadID)).toStrictEqual(thread);
            });

            it('should return null if specified annotation thread is not found', () => {
                controller.threads = {
                    1: {
                        all: jest.fn().mockReturnValue([thread])
                    }
                };
                expect(controller.getThreadByID('random')).toBeNull();
            });
        });

        describe('handleThreadEvents()', () => {
            beforeEach(() => {
                controller.emit = jest.fn();
                controller.unregisterThread = jest.fn();
                controller.localized = {
                    deleteError: 'delete error',
                    createError: 'create error'
                };
            });

            it('should mark hadPendingThreads as false and emit event on thread save or cancel', () => {
                controller.handleThreadEvents(thread, { event: THREAD_EVENT.save, data: {} });
                expect(controller.emit).toBeCalledWith(THREAD_EVENT.save, expect.any(Object));
                expect(controller.hadPendingThreads).toBeFalsy();

                controller.hadPendingThreads = true;
                controller.handleThreadEvents(thread, { event: THREAD_EVENT.cancel, data: {} });
                expect(controller.emit).toBeCalledWith(THREAD_EVENT.cancel, expect.any(Object));
                expect(controller.hadPendingThreads).toBeFalsy();
            });

            it('should unregister thread on threadCleanup', () => {
                controller.handleThreadEvents(thread, { event: THREAD_EVENT.threadCleanup, data: {} });
                expect(controller.unregisterThread).toBeCalled();
            });

            it('should unregister thread on threadDelete', () => {
                controller.handleThreadEvents(thread, { event: THREAD_EVENT.threadDelete, data: {} });
                expect(controller.unregisterThread).toBeCalled();
                expect(controller.emit).toBeCalledWith(THREAD_EVENT.threadDelete, expect.any(Object));
            });

            it('should unregister thread on deleteError', () => {
                controller.handleThreadEvents(thread, { event: THREAD_EVENT.deleteError, data: {} });
                expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.error, controller.localized.deleteError);
                expect(controller.emit).toBeCalledWith(THREAD_EVENT.deleteError, expect.any(Object));
            });

            it('should unregister thread on createError', () => {
                controller.handleThreadEvents(thread, { event: THREAD_EVENT.createError, data: {} });
                expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.error, controller.localized.createError);
                expect(controller.emit).toBeCalledWith(THREAD_EVENT.createError, expect.any(Object));
            });

            it('should emit the event on default', () => {
                controller.handleThreadEvents(thread, { event: 'random', data: {} });
                expect(controller.emit).toBeCalledWith('random', expect.any(Object));
            });
        });

        describe('pushElementHandler()', () => {
            it('should do nothing when the element is invalid', () => {
                const lengthBefore = controller.handlers.length;

                controller.pushElementHandler(undefined, 'type', jest.fn());
                const lengthAfter = controller.handlers.length;
                expect(lengthAfter).toEqual(lengthBefore);
            });

            it('should add a handler descriptor to the handlers array', () => {
                const lengthBefore = controller.handlers.length;
                const element = 'element';
                const type = ['type1', 'type2'];
                const fn = 'fn';
                const useCapture = true;

                controller.pushElementHandler(element, type, fn, useCapture);
                const { handlers } = controller;
                const lengthAfter = handlers.length;
                expect(lengthAfter).toEqual(lengthBefore + 1);
                expect(handlers[handlers.length - 1]).toStrictEqual({
                    eventObj: element,
                    func: fn,
                    type,
                    useCapture
                });
            });
        });

        describe('setupHeader()', () => {
            it('should insert the new header into the container before the baseheader', () => {
                util.insertTemplate = jest.fn();
                const container = {
                    firstElementChild: 'child'
                };
                const header = document.createElement('div');

                controller.setupHeader(container, header);
                expect(util.insertTemplate).toBeCalledWith(container, header, container.firstElementChild);
            });
        });

        describe('render()', () => {
            beforeEach(() => {
                controller.renderPage = jest.fn();
            });

            it('should do nothing if no threads exist', () => {
                controller.render();
                expect(controller.renderPage).not.toBeCalled();
            });

            it('should render the annotations on every page', () => {
                controller.threads = { 1: {}, 2: {} };
                controller.render();
                expect(controller.renderPage).toBeCalledTwice;
            });
        });

        describe('renderPage()', () => {
            it('should do nothing if no threads exist', () => {
                controller.renderPage(1);
                expect(thread.show).not.toBeCalled();
            });

            it('should render the annotations on every page', () => {
                util.isPending = jest.fn().mockReturnValue(false);
                controller.threads = {
                    // eslint-disable-next-line new-cap
                    1: new rbush(),
                    // eslint-disable-next-line new-cap
                    2: new rbush()
                };
                controller.threads[1].insert(thread);
                controller.threads[2].insert(thread);

                controller.renderPage(1);
                expect(thread.show).toHaveBeenCalledTimes(1);
                expect(thread.destroy).not.toBeCalled();
                expect(thread.unmountPopover).toBeCalled();
            });

            it('should destroy any pending annotations on re-render', () => {
                util.isPending = jest.fn().mockReturnValue(true);
                controller.threads = {
                    // eslint-disable-next-line new-cap
                    1: new rbush()
                };
                controller.threads[1].insert(thread);

                controller.renderPage(1);
                expect(thread.show).not.toBeCalled();
                expect(thread.destroy).toHaveBeenCalledTimes(1);
                expect(thread.unmountPopover).not.toBeCalled();
            });
        });

        describe('destroyPendingThreads()', () => {
            beforeEach(() => {
                util.isPending = jest.fn((state) => {
                    if (state === STATES.pending) {
                        return true;
                    }
                    return false;
                });
                controller.unregisterThread = jest.fn();
                controller.threads = {
                    1: {
                        all: jest.fn()
                    }
                };
                controller.pendingThreadID = null;
            });

            it('should not destroy and return false if there are no threads', () => {
                controller.threads = {};
                const destroyed = controller.destroyPendingThreads();
                expect(destroyed).toBeFalsy();
                expect(controller.unregisterThread).not.toBeCalled();
                expect(thread.destroy).not.toBeCalled();
            });

            it('should not destroy and return false if the threads are not pending', () => {
                thread.state = 'NOT_PENDING';
                thread.isDialogVisible = jest.fn().mockReturnValue(false);
                const destroyed = controller.destroyPendingThreads();
                expect(destroyed).toBeFalsy();
                expect(controller.unregisterThread).not.toBeCalled();
                expect(thread.destroy).not.toBeCalled();
            });

            it('should destroy only pending threads, and return true', () => {
                thread.state = 'NOT_PENDING';
                const pendingThread = {
                    threadID: '456def',
                    location: { page: 1 },
                    type: 'type',
                    state: STATES.pending,
                    destroy: jest.fn(),
                    unbindCustomListenersOnThread: jest.fn(),
                    addListener: jest.fn(),
                    removeAllListeners: jest.fn()
                };
                controller.threads[1].all = jest.fn().mockReturnValue([thread, pendingThread]);

                const destroyed = controller.destroyPendingThreads();
                expect(destroyed).toBeTruthy();
                expect(controller.unregisterThread).toBeCalled();
                expect(thread.destroy).not.toBeCalled();
                expect(pendingThread.destroy).toBeCalled();
            });
        });

        describe('getIntersectingThreads()', () => {
            beforeEach(() => {
                controller.threads = {
                    1: {
                        search: jest.fn().mockReturnValue([])
                    }
                };
            });

            it('should return an empty array if event or threads do not exist', () => {
                expect(controller.getIntersectingThreads()).toEqual([]);

                controller.threads = null;
                expect(controller.getIntersectingThreads({})).toEqual([]);
            });

            it('should return an empty array if no location is found for the mouse event', () => {
                expect(controller.getIntersectingThreads({})).toEqual([]);
            });

            it('should return an empty array if the mouse location is on a page without threads', () => {
                controller.getLocation = jest.fn().mockReturnValue({ page: 2 });
                expect(controller.getIntersectingThreads({}, { page: 1 })).toEqual([]);
            });

            it('should return an array with the intersecting thread', () => {
                controller.threads[1].search = jest.fn().mockReturnValue([thread]);
                controller.getLocation = jest.fn().mockReturnValue({ page: 1 });
                expect(controller.getIntersectingThreads({}, { page: 1 })).toContain(thread);
            });
        });

        describe('emit()', () => {
            it('should pass through the event as well as broadcast it as a controller event', () => {
                const event = 'event';
                const data = {};
                let controllerEventOccurred = false;
                let eventOccurred = false;

                controller.addListener('annotationcontrollerevent', () => {
                    controllerEventOccurred = true;
                });
                controller.addListener('event', () => {
                    eventOccurred = true;
                });
                controller.emit(event, data);

                expect(controllerEventOccurred).toBeTruthy();
                expect(eventOccurred).toBeTruthy();
            });
        });
    });
});
