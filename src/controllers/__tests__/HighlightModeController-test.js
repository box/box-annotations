/* eslint-disable no-unused-expressions */
import HighlightModeController from '../HighlightModeController';
import * as util from '../../util';
import { CLASS_ANNOTATION_MODE, THREAD_EVENT, TYPES, CONTROLLER_EVENT } from '../../constants';

let controller;
let thread;

describe('controllers/HighlightModeController', () => {
    beforeEach(() => {
        controller = new HighlightModeController();
        controller.emit = jest.fn();

        thread = {
            annotations: {},
            location: { page: 1 },
            type: TYPES.highlight,
            show: jest.fn(),
            addListener: jest.fn(),
            hideDialog: jest.fn()
        };
    });

    afterEach(() => {
        controller = null;
    });

    describe('handleThreadEvents()', () => {
        it('should render page on save only if plain highlight was converted to a highlight comment', () => {
            thread.annotations = [{ type: 'highlight' }];
            controller.renderPage = jest.fn();
            controller.handleThreadEvents(thread, { event: THREAD_EVENT.save, data: {} });
            expect(controller.renderPage).not.toBeCalled();

            thread.annotations = [{ type: 'highlight' }, { type: 'highlight-comment' }];
            controller.handleThreadEvents(thread, { event: THREAD_EVENT.save, data: {} });
            expect(controller.renderPage).toBeCalledWith(1);
        });

        it('should emit annotationsrenderpage with page number on threadCleanup', () => {
            controller.unregisterThread = jest.fn();
            controller.handleThreadEvents(thread, { event: THREAD_EVENT.threadCleanup, data: {} });
            expect(controller.unregisterThread).toBeCalled();
            expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.renderPage, thread.location.page);
        });
    });

    describe('exit()', () => {
        it('should exit annotation mode', () => {
            controller.destroyPendingThreads = jest.fn();
            controller.unbindListeners = jest.fn();

            const selection = {
                removeAllRanges: jest.fn()
            };
            window.getSelection = jest.fn().mockReturnValue(selection);

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);

            controller.exit();
            expect(controller.destroyPendingThreads).toBeCalled();
            expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.bindDOMListeners);
            expect(controller.unbindListeners).toBeCalled();
            expect(selection.removeAllRanges);
        });
    });

    describe('enter()', () => {
        it('should enter annotation mode', () => {
            controller.bindListeners = jest.fn();

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);

            controller.enter();
            expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.unbindDOMListeners);
            expect(controller.bindListeners).toBeCalled();
        });
    });

    describe('render()', () => {
        beforeEach(() => {
            controller.renderPage = jest.fn();
            controller.destroyPendingThreads = jest.fn();
        });

        it('should do nothing if no threads exist', () => {
            controller.render();
            expect(controller.renderPage).not.toBeCalled();
            expect(controller.destroyPendingThreads).toBeCalled();
        });

        it('should render the annotations on every page', () => {
            controller.threads = { 1: {}, 2: {} };
            controller.render();
            expect(controller.renderPage).toBeCalledTwice;
            expect(controller.destroyPendingThreads).toBeCalled();
        });
    });

    describe('renderPage()', () => {
        beforeEach(() => {
            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.setAttribute('data-page-number', 1);
            util.clearCanvas = jest.fn();
        });

        it('should do nothing if no threads exist', () => {
            controller.renderPage(1);
            expect(util.clearCanvas).toBeCalled();
            expect(thread.show).not.toBeCalled();
        });

        it('should render the annotations on the specified page', () => {
            controller.registerThread(thread);
            controller.renderPage(1);
            expect(util.clearCanvas).toBeCalled();
            expect(thread.show).toBeCalled();
        });
    });
});
