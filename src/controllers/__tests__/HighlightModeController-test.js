import EventEmitter from 'events';
import HighlightModeController from '../HighlightModeController';
import * as util from '../../util';
import {
    CLASS_HIDDEN,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    THREAD_EVENT,
    STATES,
    CONTROLLER_EVENT,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT
} from '../../constants';

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
            show: () => {}
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

        it('should render page on threadCleanup', () => {
            sandbox.stub(controller, 'unregisterThread');
            sandbox.stub(controller, 'renderPage');
            controller.handleThreadEvents(stubs.thread, { event: THREAD_EVENT.threadCleanup, data: {} });
            expect(controller.unregisterThread).to.be.called;
            expect(controller.renderPage).to.be.calledWith(1);
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
            controller.threads = {
                1: { '123abc': stubs.thread }
            };
            stubs.threadMock.expects('show').once();
            controller.renderPage(1);
            expect(util.clearCanvas).to.be.called;
        });
    });
});
