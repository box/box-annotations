/* eslint-disable no-unused-expressions */
import HighlightModeController from '../HighlightModeController';
import * as util from '../../util';
import { CLASS_ANNOTATION_MODE, THREAD_EVENT, TYPES, CONTROLLER_EVENT } from '../../constants';

let controller;
let stubs = {};
const sandbox = sinon.sandbox.create();

describe('controllers/HighlightModeController', () => {
    beforeEach(() => {
        controller = new HighlightModeController();
        sandbox.stub(controller, 'emit');
        stubs.thread = {
            annotations: {},
            location: { page: 1 },
            type: TYPES.highlight,
            show: () => {},
            addListener: () => {}
        };
        stubs.threadMock = sandbox.mock(stubs.thread);
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
        stubs = {};
        controller = null;
    });

    describe('handleThreadEvents()', () => {
        it('should render page on save only if plain highlight was converted to a highlight comment', () => {
            stubs.thread.annotations = {
                1: { type: 'highlight' }
            };
            sandbox.stub(controller, 'renderPage');
            controller.handleThreadEvents(stubs.thread, { event: THREAD_EVENT.save, data: {} });
            expect(controller.renderPage).to.not.be.called;

            stubs.thread.annotations = {
                1: { type: 'highlight' },
                2: { type: 'highlight-comment' }
            };
            controller.handleThreadEvents(stubs.thread, { event: THREAD_EVENT.save, data: {} });
            expect(controller.renderPage).to.be.calledWith(1);
        });

        it('should emit annotationsrenderpage with page number on threadCleanup', () => {
            sandbox.stub(controller, 'unregisterThread');
            controller.handleThreadEvents(stubs.thread, { event: THREAD_EVENT.threadCleanup, data: {} });
            expect(controller.unregisterThread).to.be.called;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.renderPage, stubs.thread.location.page);
        });
    });

    describe('exit()', () => {
        it('should exit annotation mode', () => {
            sandbox.stub(controller, 'destroyPendingThreads');
            sandbox.stub(controller, 'unbindListeners');

            const selection = window.getSelection();
            sandbox.stub(selection, 'removeAllRanges');

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);

            controller.exit();
            expect(controller.destroyPendingThreads).to.be.called;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.bindDOMListeners);
            expect(controller.unbindListeners).to.be.called;
            expect(selection.removeAllRanges);
        });
    });

    describe('enter()', () => {
        it('should enter annotation mode', () => {
            sandbox.stub(controller, 'bindListeners');

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);

            controller.enter();
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.unbindDOMListeners);
            expect(controller.bindListeners).to.be.called;
        });
    });

    describe('render()', () => {
        beforeEach(() => {
            sandbox.stub(controller, 'renderPage');
            sandbox.stub(controller, 'destroyPendingThreads');
        });

        it('should do nothing if no threads exist', () => {
            controller.render();
            expect(controller.renderPage).to.not.be.called;
            expect(controller.destroyPendingThreads).to.be.called;
        });

        it('should render the annotations on every page', () => {
            controller.threads = { 1: {}, 2: {} };
            controller.render();
            expect(controller.renderPage).to.be.calledTwice;
            expect(controller.destroyPendingThreads).to.be.called;
        });
    });

    describe('renderPage()', () => {
        beforeEach(() => {
            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.setAttribute('data-page-number', 1);
            sandbox.stub(util, 'clearCanvas');
        });

        it('should do nothing if no threads exist', () => {
            stubs.threadMock.expects('show').never();
            controller.renderPage(1);
            expect(util.clearCanvas).to.be.called;
        });

        it('should render the annotations on the specified page', () => {
            controller.registerThread(stubs.thread);
            stubs.threadMock.expects('show');
            controller.renderPage(1);
            expect(util.clearCanvas).to.be.called;
        });
    });
});
