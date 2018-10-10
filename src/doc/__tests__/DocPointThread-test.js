/* eslint-disable no-unused-expressions */
import DocPointDialog from '../DocPointDialog';
import DocPointThread from '../DocPointThread';
import AnnotationThread from '../../AnnotationThread';
import * as util from '../../util';
import * as docUtil from '../docUtil';
import { STATES, SELECTOR_ANNOTATED_ELEMENT } from '../../constants';

let thread;
const html = '<div class="annotated-element"></div>';

describe('doc/DocPointThread', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        thread = new DocPointThread({
            annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
            annotations: [],
            api: {},
            fileVersionId: 1,
            location: {},
            threadID: 2,
            type: 'point',
            permissions: {
                canAnnotate: true
            }
        });
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        thread = null;
    });

    describe('showDialog', () => {
        it('should not call parent showDialog if user can annotate and there is a selection present', () => {
            docUtil.isSelectionPresent = jest.fn().mockReturnValue(true);

            // This stubs out a parent method by forcing the method we care about
            // in the prototype of the prototype of DocPointThread (ie
            // AnnotationThread's prototype) to be a stub
            Object.defineProperty(Object.getPrototypeOf(DocPointThread.prototype), 'showDialog', {
                value: jest.fn()
            });

            thread.showDialog();

            expect(AnnotationThread.prototype.showDialog).not.toBeCalled();
        });

        it('should call parent showDialog if user can\'t annotate', () => {
            thread.permissions.canAnnotate = false;
            Object.defineProperty(Object.getPrototypeOf(DocPointThread.prototype), 'showDialog', {
                value: jest.fn()
            });

            thread.showDialog();

            expect(AnnotationThread.prototype.showDialog).toBeCalled();
        });

        it('should call parent showDialog if there isn\'t a selection present', () => {
            docUtil.isSelectionPresent = jest.fn().mockReturnValue(false);
            Object.defineProperty(Object.getPrototypeOf(DocPointThread.prototype), 'showDialog', {
                value: jest.fn()
            });

            thread.showDialog();

            expect(AnnotationThread.prototype.showDialog).toBeCalled();
        });
    });

    describe('show', () => {
        beforeEach(() => {
            util.showElement = jest.fn();
            thread.showDialog = jest.fn();
            docUtil.getBrowserCoordinatesFromLocation = jest.fn().mockReturnValue([1, 2]);
        });

        it('should show the thread', () => {
            thread.show();
            expect(docUtil.getBrowserCoordinatesFromLocation).toBeCalledWith(thread.location, thread.annotatedElement);
            expect(util.showElement).toBeCalledWith(thread.element);
        });

        it('should show the dialog if the state is pending', () => {
            thread.state = STATES.pending;
            thread.show();
            expect(thread.showDialog).toBeCalled();
        });

        it('should not show the dialog if the state is not pending', () => {
            thread.state = STATES.inactive;
            thread.show();
            expect(thread.showDialog).not.toBeCalled();
        });

        it('should not show dialog if user is on a mobile device and the thread has no annotations yet', () => {
            thread.isMobile = true;
            thread.annotations = [];
            thread.state = STATES.inactive;
            thread.show();
            expect(thread.showDialog).not.toBeCalled();
        });
    });

    describe('createDialog', () => {
        it('should initialize an appropriate dialog', () => {
            thread.createDialog();
            expect(thread.dialog instanceof DocPointDialog).toBeTruthy();
        });
    });
});
