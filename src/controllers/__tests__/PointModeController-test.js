/* eslint-disable no-unused-expressions */
import PointModeController from '../PointModeController';
import AnnotationModeController from '../AnnotationModeController';
import * as util from '../../util';
import {
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    THREAD_EVENT,
    CONTROLLER_EVENT,
    SELECTOR_ANNOTATION_BUTTON_POINT_EXIT,
    SELECTOR_POINT_MODE_HEADER
} from '../../constants';

let controller;
let thread;

describe('controllers/PointModeController', () => {
    beforeEach(() => {
        controller = new PointModeController();
        controller.container = document;
        controller.emit = jest.fn();

        thread = {
            show: jest.fn(),
            getThreadEventData: jest.fn(),
            destroy: jest.fn()
        };

        controller.annotatedElement = {};
        controller.annotator = {
            getLocationFromEvent: jest.fn(),
            createAnnotationThread: jest.fn()
        };
    });

    afterEach(() => {
        controller = null;
    });

    describe('init()', () => {
        it('should set up the point annotations header if using the preview header', () => {
            Object.defineProperty(AnnotationModeController.prototype, 'init', { value: jest.fn() });
            controller.setupHeader = jest.fn();
            controller.init({ options: { header: 'light' } });
            expect(controller.setupHeader).toBeCalled();
        });
    });

    describe('setupHeader', () => {
        it('should setup header and get all the mode buttons', () => {
            const blankDiv = document.createElement('div');
            util.insertTemplate = jest.fn();
            controller.getButton = jest.fn().mockReturnValue(blankDiv);
            controller.localized = { closeButton: 'Close' };

            controller.setupHeader(blankDiv, blankDiv);
            expect(controller.getButton).toBeCalledWith(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);
        });
    });

    describe('setupSharedDialog()', () => {
        it('should create a shared annotation dialog', () => {
            const options = {
                isMobile: true,
                hasTouch: false,
                localized: { cancelButton: 'cancel' }
            };

            controller.setupSharedDialog(document.createElement('div'), options);
            expect(controller.createDialog).not.toBeUndefined();
        });
    });

    describe('onDialogCancel()', () => {
        it('should unregister/destroy the pending thread and clear the create dialog', () => {
            controller.getThreadByID = jest.fn().mockReturnValue(thread);
            controller.unregisterThread = jest.fn();
            controller.hideSharedDialog = jest.fn();

            controller.onDialogCancel();
            expect(controller.unregisterThread).toBeCalledWith(thread);
            expect(controller.hideSharedDialog).toBeCalled();
            expect(thread.destroy).toBeCalled();
        });
    });

    describe('onDialogPost()', () => {
        it('should notify listeners of post event and clear the create dialog', () => {
            controller.hideSharedDialog = jest.fn();
            controller.lastPointEvent = {};
            controller.pendingThreadID = '123abc';

            controller.onDialogPost('text');
            expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.createThread, {
                commentText: 'text',
                lastPointEvent: {},
                pendingThreadID: '123abc'
            });
            expect(controller.hideSharedDialog).toBeCalled();
        });
    });

    describe('hideSharedDialog', () => {
        it('should not hide the shared annotation dialog if already hidden', () => {
            controller.createDialog = { hide: jest.fn() };
            controller.createDialog.isVisible = false;
            controller.hideSharedDialog();
            expect(controller.createDialog.hide).not.toBeCalled();
        });

        it('should hide the shared annotation dialog', () => {
            controller.createDialog = { hide: jest.fn() };
            controller.createDialog.isVisible = true;
            controller.hideSharedDialog();
            expect(controller.createDialog.hide).toBeCalled();
        });
    });

    describe('setupHandlers()', () => {
        it('should successfully contain mode handlers', () => {
            controller.pushElementHandler = jest.fn();
            controller.exitButtonEl = 'also definitely not undefined';

            controller.setupHandlers();
            expect(controller.pushElementHandler).toBeCalledWith(
                controller.annotatedElement,
                ['click', 'touchstart'],
                controller.pointClickHandler,
                true
            );
            expect(controller.pushElementHandler).toBeCalledWith(
                controller.exitButtonEl,
                'click',
                controller.toggleMode
            );
        });
    });

    describe('exit()', () => {
        beforeEach(() => {
            controller.destroyPendingThreads = jest.fn();
            controller.unbindListeners = jest.fn();

            // Set up annotation mode
            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);
            controller.headerElement = document.createElement('div');

            controller.buttonEl = document.createElement('button');
            controller.buttonEl.classList.add(CLASS_ACTIVE);
        });

        it('should hide the createDialog if it exists', () => {
            controller.createDialog = {
                hide: jest.fn()
            };
            controller.exit();
            expect(controller.createDialog.hide).toBeCalled();
        });

        it('should exit annotation mode', () => {
            controller.exit();
            expect(controller.destroyPendingThreads).toBeCalled();
            expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.exit, expect.any(Object));
            expect(controller.unbindListeners).toBeCalled();
            expect(controller.hadPendingThreads).toBeFalsy();
        });

        it('should deactive mode button if available', () => {
            controller.buttonEl = document.createElement('button');
            controller.buttonEl.classList.add(CLASS_ACTIVE);
            controller.exit();
            expect(controller.buttonEl.classList).not.toContain(CLASS_ACTIVE);
        });
    });

    describe('enter()', () => {
        beforeEach(() => {
            controller.bindListeners = jest.fn();
            util.replaceHeader = jest.fn();

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);
            controller.headerElement = document.createElement('div');

            controller.buttonEl = document.createElement('button');
            controller.buttonEl.classList.add(CLASS_ACTIVE);
        });

        it('should enter annotation mode', () => {
            controller.enter();
            expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.enter, expect.any(Object));
            expect(controller.bindListeners).toBeCalled();
            expect(util.replaceHeader).toBeCalledWith(controller.headerElement, SELECTOR_POINT_MODE_HEADER);
        });

        it('should activate mode button if available', () => {
            controller.buttonEl = document.createElement('button');
            controller.enter();
            expect(controller.buttonEl.classList).toContain(CLASS_ACTIVE);
            expect(util.replaceHeader).toBeCalledWith(controller.headerElement, SELECTOR_POINT_MODE_HEADER);
        });
    });

    describe('pointClickHandler()', () => {
        const event = {
            stopPropagation: jest.fn(),
            preventDefault: jest.fn()
        };

        beforeEach(() => {
            controller.destroyPendingThreads = jest.fn().mockReturnValue(false);
            util.isInAnnotationOrMarker = jest.fn().mockReturnValue(false);
            controller.registerThread = jest.fn();
            controller.hideSharedDialog = jest.fn();
            controller.modeButton = {
                title: 'Point Annotation Mode',
                selector: '.bp-btn-annotate'
            };
            util.isInDialog = jest.fn().mockReturnValue(false);
        });

        afterEach(() => {
            controller.modeButton = {};
            controller.container = document;
        });

        it('should not prevent default events if click occurred in an annotation or marker', () => {
            util.isInAnnotationOrMarker = jest.fn().mockReturnValue(true);
            controller.pointClickHandler(event);
            expect(event.stopPropagation).not.toBeCalled();
            expect(event.preventDefault).not.toBeCalled();
        });

        it('should not destroy the pending thread if click was in the dialog', () => {
            controller.destroyPendingThreads = jest.fn().mockReturnValue(true);
            util.isInDialog = jest.fn().mockReturnValue(true);
            controller.pointClickHandler(event);
            expect(controller.destroyPendingThreads).not.toBeCalled();
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
        });

        it('should reset the mobile annotations dialog if the user is on a mobile device', () => {
            controller.isMobile = true;

            controller.pointClickHandler(event);
            expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.resetMobileDialog);
            expect(controller.annotator.getLocationFromEvent).toBeCalled();
            expect(thread.show).not.toBeCalled();
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
        });

        it('should not do anything if thread is invalid', () => {
            controller.pointClickHandler(event);
            expect(controller.registerThread).not.toBeCalled();
            expect(controller.hideSharedDialog).toBeCalled();
            expect(thread.show).not.toBeCalled();
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
            expect(controller.annotator.getLocationFromEvent).toBeCalled();
        });

        it('should not create a thread if a location object cannot be inferred from the event', () => {
            controller.annotator.getLocationFromEvent = jest.fn().mockReturnValue(null);
            controller.annotator.createAnnotationThread = jest.fn();

            controller.pointClickHandler(event);
            expect(controller.registerThread).not.toBeCalled();
            expect(controller.hideSharedDialog).toBeCalled();
            expect(thread.show).not.toBeCalled();
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
            expect(controller.annotator.createAnnotationThread).not.toBeCalled();
            expect(controller.annotator.getLocationFromEvent).toBeCalled();
        });

        it('should create, show, and bind listeners to a thread', () => {
            controller.annotator.getLocationFromEvent = jest.fn().mockReturnValue({});
            controller.annotator.createAnnotationThread = jest.fn().mockReturnValue(thread);
            thread.getThreadEventData = jest.fn().mockReturnValue('data');

            controller.pointClickHandler(event);
            expect(controller.registerThread).toBeCalled();
            expect(controller.emit).toBeCalledWith(THREAD_EVENT.pending, 'data');
            expect(controller.registerThread).toBeCalledWith(thread);
            expect(controller.hideSharedDialog).not.toBeCalled();
            expect(thread.show).toBeCalled();
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
            expect(controller.annotator.getLocationFromEvent).toBeCalled();
        });

        it('should show the create dialog', () => {
            controller.annotator.getLocationFromEvent = jest.fn().mockReturnValue({});
            controller.annotator.createAnnotationThread = jest.fn().mockReturnValue(thread);
            thread.getThreadEventData = jest.fn().mockReturnValue('data');

            controller.isMobile = true;
            controller.container = document.createElement('div');
            controller.createDialog = {
                containerEl: document.createElement('div'),
                show: jest.fn(),
                showCommentBox: jest.fn()
            };

            controller.pointClickHandler(event);
            expect(controller.hideSharedDialog).not.toBeCalled();
            expect(thread.show).toBeCalled();
            expect(controller.createDialog.show).toBeCalledWith(controller.container);
            expect(controller.createDialog.showCommentBox).toBeCalled();
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
            expect(controller.annotator.getLocationFromEvent).toBeCalled();
        });
    });
});
