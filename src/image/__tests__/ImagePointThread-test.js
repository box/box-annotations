/* eslint-disable no-unused-expressions */
import ImagePointDialog from '../ImagePointDialog';
import ImagePointThread from '../ImagePointThread';
import * as annotatorUtil from '../../annotatorUtil';
import { STATES } from '../../annotationConstants';
import * as imageAnnotatorUtil from '../imageAnnotatorUtil';

let thread;
const sandbox = sinon.sandbox.create();

describe('image/ImagePointThread', () => {
    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('image/__tests__/ImagePointThread-test.html');

        thread = new ImagePointThread({
            annotatedElement: document.querySelector('.annotated-element'),
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

        thread.isMobile = false;
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
    });

    describe('show', () => {
        beforeEach(() => {
            sandbox.stub(annotatorUtil, 'showElement');
            sandbox.stub(thread, 'showDialog');
        });

        it('should show the thread', () => {
            sandbox.stub(imageAnnotatorUtil, 'getBrowserCoordinatesFromLocation').returns([1, 2]);

            thread.show();

            expect(imageAnnotatorUtil.getBrowserCoordinatesFromLocation).to.be.calledWith(
                thread.location,
                thread.annotatedElement
            );
            expect(annotatorUtil.showElement).to.be.calledWith(thread.element);
        });

        it('should show the dialog if the state is pending', () => {
            sandbox.stub(imageAnnotatorUtil, 'getBrowserCoordinatesFromLocation').returns([1, 2]);

            thread.state = STATES.pending;
            thread.show();

            expect(thread.showDialog).to.be.called;
        });

        it('should not show the dialog if the state is not pending', () => {
            sandbox.stub(imageAnnotatorUtil, 'getBrowserCoordinatesFromLocation').returns([1, 2]);

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
            expect(thread.dialog instanceof ImagePointDialog).to.be.true;
        });
    });
});
