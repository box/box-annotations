/* eslint-disable no-unused-expressions */
import ImageAnnotator from '../ImageAnnotator';
import ImagePointThread from '../ImagePointThread';
import * as annotatorUtil from '../../annotatorUtil';
import * as imageAnnotatorUtil from '../imageAnnotatorUtil';
import { SELECTOR_ANNOTATION_POINT_BUTTON } from '../../annotationConstants';

let annotator;
const sandbox = sinon.sandbox.create();

describe('lib/image/ImageAnnotator', () => {
    before(() => {
        fixture.setBase('src/lib');
    });

    beforeEach(() => {
        fixture.load('image/__tests__/ImageAnnotator-test.html');

        annotator = new ImageAnnotator({
            canAnnotate: true,
            container: document,
            annotationService: {},
            fileVersionId: 1,
            isMobile: false,
            options: {},
            modeButtons: {}
        });
        annotator.annotatedElement = annotator.getAnnotatedEl(document);
        annotator.annotationService = {};
    });

    afterEach(() => {
        sandbox.verifyAndRestore();

        annotator = null;
    });

    describe('getAnnotatedEl()', () => {
        it('should return the annotated element as the document', () => {
            expect(annotator.annotatedElement).to.not.be.null;
        });
    });

    describe('getLocationFromEvent()', () => {
        let event = {};
        let imageEl = {};
        const x = 100;
        const y = 200;
        const dimensions = {
            x: 100,
            y: 200
        };

        beforeEach(() => {
            annotator.isMobile = false;
            imageEl = annotator.annotatedElement.querySelector('img');
            event = {
                targetTouches: [{
                    clientX: x,
                    clientY: y,
                    target: imageEl
                }]
            };
        });

        it('should not return a location if image isn\'t inside viewer', () => {
            annotator.annotatedElement = document.createElement('div');
            const location = annotator.getLocationFromEvent({
                target: {
                    nodeName: 'not-annotated'
                }
            });
            expect(location).to.be.null;
        });

        it('should not return a location if no touch event is available and user is on a mobile device', () => {
            annotator.isMobile = true;
            expect(annotator.getLocationFromEvent({ targetTouches: [] })).to.be.null;
        });

        it('should replace event with mobile touch event if user is on a mobile device', () => {
            annotator.isMobile = true;
            annotator.getLocationFromEvent(event);
        });

        it('should not return a location if there are no touch event and the user is on a mobile device', () => {
            annotator.isMobile = true;
            const location = annotator.getLocationFromEvent({
                target: {
                    nodeName: 'not-annotated'
                }
            });
            expect(location).to.be.null;

            event = {
                targetTouches: [{
                    target: imageEl
                }]
            };
            expect(annotator.getLocationFromEvent(event)).to.be.null;
        });

        it('should not return a location if click event does not have coordinates', () => {
            event = { target: imageEl };
            expect(annotator.getLocationFromEvent(event)).to.be.null;
        });

        it('should return a valid point location if click is valid', () => {
            sandbox.stub(annotatorUtil, 'getScale').returns(1);
            sandbox.stub(imageAnnotatorUtil, 'getLocationWithoutRotation').returns([x, y]);

            const location = annotator.getLocationFromEvent({
                clientX: x,
                clientY: y,
                target: imageEl
            });
            expect(location).to.deep.equal({
                x,
                y,
                imageEl,
                dimensions,
                page: 1
            });
        });
    });

    describe('createAnnotationThread()', () => {
        it('should create, add point thread to internal map, and return it', () => {
            sandbox.stub(annotatorUtil, 'validateThreadParams').returns(true);
            sandbox.stub(annotator, 'addThreadToMap');
            sandbox.stub(annotator, 'handleValidationError');
            const thread = annotator.createAnnotationThread([], { page: 2 }, 'point');

            expect(annotator.addThreadToMap).to.have.been.called;
            expect(thread instanceof ImagePointThread).to.be.true;
            expect(annotator.handleValidationError).to.not.be.called;
            expect(thread.location.page).equals(2);
        });

        it('should emit error and return undefined if thread params are invalid', () => {
            sandbox.stub(annotatorUtil, 'validateThreadParams').returns(false);
            sandbox.stub(annotator, 'handleValidationError');
            const thread = annotator.createAnnotationThread([], {}, 'point');
            expect(thread instanceof ImagePointThread).to.be.false;
            expect(annotator.handleValidationError).to.be.called;
        });

        it('should force page number 1 if the annotation was created without one', () => {
            sandbox.stub(annotatorUtil, 'validateThreadParams').returns(true);
            sandbox.stub(annotator, 'addThreadToMap');
            sandbox.stub(annotator, 'handleValidationError');
            const thread = annotator.createAnnotationThread([], {}, 'point');

            expect(annotator.addThreadToMap).to.have.been.called;
            expect(thread instanceof ImagePointThread).to.be.true;
            expect(annotator.handleValidationError).to.not.be.called;
            expect(thread.location.page).equals(1);
        });

        it('should force page number 1 if the annotation was created wit page number -1', () => {
            sandbox.stub(annotatorUtil, 'validateThreadParams').returns(true);
            sandbox.stub(annotator, 'addThreadToMap');
            sandbox.stub(annotator, 'handleValidationError');
            const thread = annotator.createAnnotationThread([], { page: -1 }, 'point');

            expect(annotator.addThreadToMap).to.have.been.called;
            expect(thread instanceof ImagePointThread).to.be.true;
            expect(annotator.handleValidationError).to.not.be.called;
            expect(thread.location.page).equals(1);
        });
    });
});
