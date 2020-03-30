/* eslint-disable no-unused-expressions */
import PointModeController from '../PointModeController';
import AnnotationModeController from '../AnnotationModeController';
import * as util from '../../util';
import {
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    THREAD_EVENT,
    CONTROLLER_EVENT,
    SELECTOR_POINT_MODE_HEADER,
} from '../../constants';
import AnnotationThread from '../../AnnotationThread';
import Annotator from '../../Annotator';

jest.mock('../../AnnotationThread');
jest.mock('../../Annotator');

let controller;
let thread;

describe('controllers/PointModeController', () => {
    let rootElement;
    const intlMock = {
        formatMessage: message => message.defaultMessage,
    };

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = document.createElement('div');
        document.body.appendChild(rootElement);

        controller = new PointModeController();
        controller.intl = intlMock;
        controller.container = document;
        controller.emit = jest.fn();
        controller.registerThread = jest.fn();
        controller.getLocation = jest.fn();
        controller.api = { user: {} };

        thread = new AnnotationThread();
        thread.type = 'point';
        thread.location = {};

        controller.annotatedElement = rootElement;
        controller.annotator = new Annotator();

        util.getPopoverLayer = jest.fn().mockReturnValue(rootElement);
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

    describe('setupHandlers()', () => {
        it('should successfully contain mode handlers', () => {
            controller.pushElementHandler = jest.fn();
            controller.exitButtonEl = 'also definitely not undefined';

            controller.setupHandlers();
            expect(controller.pushElementHandler).toBeCalledWith(
                controller.annotatedElement,
                ['click', 'touchstart'],
                controller.pointClickHandler,
                true,
            );
        });
    });

    describe('resetMode()', () => {
        it('should reset annotation mode', () => {
            // Set up annotation mode
            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);
            controller.headerElement = document.createElement('div');

            controller.buttonEl = document.createElement('button');
            controller.buttonEl.classList.add(CLASS_ACTIVE);
            controller.getThreadByID = jest.fn().mockReturnValue(thread);
            controller.destroyThread = jest.fn();

            controller.buttonEl = document.createElement('button');
            controller.buttonEl.classList.add(CLASS_ACTIVE);
            controller.resetMode();
            expect(controller.buttonEl.classList).not.toContain(CLASS_ACTIVE);
            expect(controller.hadPendingThreads).toBeFalsy();
            expect(controller.destroyThread).toBeCalledWith(thread);
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
            preventDefault: jest.fn(),
        };

        beforeEach(() => {
            controller.destroyPendingThreads = jest.fn().mockReturnValue(false);
            controller.applyActionToThreads = jest.fn();
            util.isInAnnotationOrMarker = jest.fn().mockReturnValue(false);
            controller.modeButton = {
                title: 'Point Annotation Mode',
                selector: '.bp-btn-annotate',
            };
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
            expect(controller.destroyPendingThreads).not.toBeCalled();
            expect(controller.applyActionToThreads).not.toBeCalled();
        });

        it('should not destroy the pending thread if click was in an annotation or marker', () => {
            controller.pointClickHandler(event);
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
        });

        it('should not do anything if thread is invalid', () => {
            controller.pointClickHandler(event);
            expect(controller.registerThread).not.toBeCalled();
            expect(thread.show).not.toBeCalled();
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
            expect(controller.getLocation).toBeCalled();
            expect(controller.destroyPendingThreads).toBeCalled();
            expect(controller.applyActionToThreads).toBeCalled();
        });

        it('should not create a thread if a location object cannot be inferred from the event', () => {
            controller.getLocation = jest.fn().mockReturnValue(null);
            controller.registerThread = jest.fn();

            controller.pointClickHandler(event);
            expect(controller.registerThread).not.toBeCalled();
            expect(thread.show).not.toBeCalled();
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
            expect(controller.registerThread).not.toBeCalled();
            expect(controller.getLocation).toBeCalled();
            expect(controller.destroyPendingThreads).toBeCalled();
            expect(controller.applyActionToThreads).toBeCalled();
        });

        it('should create, show, and bind listeners to a thread', () => {
            controller.getLocation = jest.fn().mockReturnValue({});
            controller.registerThread = jest.fn().mockReturnValue(thread);
            thread.getThreadEventData = jest.fn().mockReturnValue('data');

            controller.pointClickHandler(event);
            expect(controller.registerThread).toBeCalled();
            expect(controller.emit).toBeCalledWith(THREAD_EVENT.pending, 'data');
            expect(controller.registerThread).toBeCalled();
            expect(thread.show).toBeCalled();
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
            expect(controller.getLocation).toBeCalled();
            expect(controller.destroyPendingThreads).toBeCalled();
            expect(controller.applyActionToThreads).toBeCalled();
        });
    });
});
