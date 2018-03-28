/* eslint-disable no-unused-expressions */
import DocPointDialog from '../DocPointDialog';
import DocPointThread from '../DocPointThread';
import AnnotationThread from '../../AnnotationThread';
import * as util from '../../util';
import * as docUtil from '../docUtil';
import { STATES } from '../../constants';

let thread;
const sandbox = sinon.sandbox.create();

const SELECTOR_ANNOTATED_ELEMENT = '.annotated-element';

describe('doc/DocPointThread', () => {
    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('doc/__tests__/DocPointThread-test.html');

        thread = new DocPointThread({
            annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
            annotations: [],
            annotationService: {},
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
        sandbox.verifyAndRestore();
        thread = null;
    });

    describe('showDialog', () => {
        it('should not call parent showDialog if user can annotate and there is a selection present', () => {
            sandbox.stub(docUtil, 'isSelectionPresent').returns(true);

            // This stubs out a parent method by forcing the method we care about
            // in the prototype of the prototype of DocPointThread (ie
            // AnnotationThread's prototype) to be a stub
            Object.defineProperty(Object.getPrototypeOf(DocPointThread.prototype), 'showDialog', {
                value: sandbox.stub()
            });

            thread.showDialog();

            expect(AnnotationThread.prototype.showDialog).to.not.be.called;
        });

        it('should call parent showDialog if user can\'t annotate', () => {
            thread.permissions.canAnnotate = false;
            Object.defineProperty(Object.getPrototypeOf(DocPointThread.prototype), 'showDialog', {
                value: sandbox.stub()
            });

            thread.showDialog();

            expect(AnnotationThread.prototype.showDialog).to.be.called;
        });

        it('should call parent showDialog if there isn\'t a selection present', () => {
            sandbox.stub(docUtil, 'isSelectionPresent').returns(false);
            Object.defineProperty(Object.getPrototypeOf(DocPointThread.prototype), 'showDialog', {
                value: sandbox.stub()
            });

            thread.showDialog();

            expect(AnnotationThread.prototype.showDialog).to.be.called;
        });
    });

    describe('show', () => {
        beforeEach(() => {
            sandbox.stub(util, 'showElement');
            sandbox.stub(thread, 'showDialog');
        });

        it('should show the thread', () => {
            sandbox.stub(docUtil, 'getBrowserCoordinatesFromLocation').returns([1, 2]);

            thread.show();

            expect(docUtil.getBrowserCoordinatesFromLocation).to.be.calledWith(
                thread.location,
                thread.annotatedElement
            );
            expect(util.showElement).to.be.calledWith(thread.element);
        });

        it('should show the dialog if the state is pending', () => {
            sandbox.stub(docUtil, 'getBrowserCoordinatesFromLocation').returns([1, 2]);

            thread.state = STATES.pending;
            thread.show();

            expect(thread.showDialog).to.be.called;
        });

        it('should not show the dialog if the state is not pending', () => {
            sandbox.stub(docUtil, 'getBrowserCoordinatesFromLocation').returns([1, 2]);

            thread.state = STATES.inactive;
            thread.show();

            expect(thread.showDialog).to.not.be.called;
        });

        it('should not show dialog if user is on a mobile device and the thread has no annotations yet', () => {
            thread.isMobile = true;
            thread.annotations = {};

            thread.state = STATES.inactive;
            thread.show();

            expect(thread.showDialog).to.not.be.called;
        });
    });

    describe('createDialog', () => {
        it('should initialize an appropriate dialog', () => {
            thread.createDialog();
            expect(thread.dialog instanceof DocPointDialog).to.be.true;
        });
    });
});
