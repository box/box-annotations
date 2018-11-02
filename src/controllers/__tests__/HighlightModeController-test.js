/* eslint-disable no-unused-expressions */
import rbush from 'rbush';
import HighlightModeController from '../HighlightModeController';
import * as util from '../../util';
import { CLASS_ANNOTATION_MODE, THREAD_EVENT, TYPES, CONTROLLER_EVENT } from '../../constants';
import DocHighlightThread from '../../doc/DocHighlightThread';

jest.mock('../../doc/DocHighlightThread');

let controller;
let thread;

const html = `<div class="annotated-element">
  <div data-page-number="1"></div>
  <div data-page-number="2"></div>
</div>`;

describe('controllers/HighlightModeController', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        controller = new HighlightModeController();
        controller.emit = jest.fn();
        controller.registerThread = jest.fn();
        controller.getLocation = jest.fn();
        controller.annotatedElement = rootElement;

        thread = new DocHighlightThread();
        thread.annotatedElement = rootElement;
        thread.location = { page: 1 };
        thread.annotations = {};
        thread.type = TYPES.highlight;

        util.getPopoverLayer = jest.fn().mockReturnValue(rootElement);
        util.shouldDisplayMobileUI = jest.fn().mockReturnValue(false);
    });

    afterEach(() => {
        controller = null;
    });

    describe('handleThreadEvents()', () => {
        it('should render page on save only if plain highlight was converted to a highlight comment', () => {
            thread.comments = [];
            controller.renderPage = jest.fn();
            controller.handleThreadEvents(thread, { event: THREAD_EVENT.save, data: {} });
            expect(controller.renderPage).not.toBeCalled();

            thread.comments = [{ type: 'highlight-comment' }];
            controller.handleThreadEvents(thread, { event: THREAD_EVENT.save, data: {} });
            expect(controller.renderPage).toBeCalledWith(1);
        });

        it('should emit annotationsrenderpage with page number on delete', () => {
            controller.unregisterThread = jest.fn();
            controller.handleThreadEvents(thread, { event: THREAD_EVENT.delete, data: {} });
            expect(controller.emit).toBeCalledWith(CONTROLLER_EVENT.renderPage, thread.location.page);
        });
    });

    describe('resetMode()', () => {
        it('should exit annotation mode', () => {
            controller.destroyPendingThreads = jest.fn();
            controller.unbindListeners = jest.fn();

            const selection = {
                removeAllRanges: jest.fn()
            };
            window.getSelection = jest.fn().mockReturnValue(selection);

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);

            controller.resetMode();
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
            controller.annotations = { 1: {}, 2: {} };
            controller.render();
            expect(controller.renderPage).toBeCalledTwice;
            expect(controller.destroyPendingThreads).toBeCalled();
        });
    });

    describe('renderPage()', () => {
        it('should clear the canvas on the specified page', () => {
            util.clearCanvas = jest.fn();
            controller.annotations = {
                // eslint-disable-next-line new-cap
                1: new rbush()
            };
            controller.renderPage(1);
            expect(util.clearCanvas).toBeCalled();
        });
    });
});
