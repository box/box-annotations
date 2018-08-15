/* eslint-disable no-unused-expressions */
import ImageAnnotator from '../ImageAnnotator';
import ImagePointThread from '../ImagePointThread';
import * as util from '../../util';
import * as imageUtil from '../imageUtil';
import { TYPES, ANNOTATOR_EVENT } from '../../constants';

let annotator;
const html = `<div class="bp-image annotated-element">
    <img class="page" width="100px" height="200px" data-page-number="1">
    <button class="ba-point-annotation-marker"></button>
</div>
`;

describe('image/ImageAnnotator', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        const options = {
            annotator: {
                NAME: 'name',
                TYPE: [TYPES.point]
            }
        };
        annotator = new ImageAnnotator({
            canAnnotate: true,
            container: document,
            annotationService: {},
            file: {
                file_version: { id: 1 }
            },
            isMobile: false,
            options,
            modeButtons: {},
            location: {
                locale: 'en-US'
            },
            localizedStrings: {
                anonymousUserName: 'anonymous',
                loadError: 'loaderror'
            }
        });
        annotator.annotatedElement = annotator.getAnnotatedEl(document);
        annotator.annotationService = {};
        annotator.threads = {};
        annotator.modeControllers = {};
        annotator.permissions = annotator.getAnnotationPermissions(annotator.options.file);

        annotator.emit = jest.fn();
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        annotator = null;
    });

    describe('getAnnotatedEl()', () => {
        it('should return the annotated element as the document', () => {
            expect(annotator.annotatedElement).not.toBeNull();
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
            annotator.hasTouch = false;
            imageEl = annotator.annotatedElement.querySelector('img');
            event = {
                targetTouches: [
                    {
                        clientX: x,
                        clientY: y,
                        target: imageEl
                    }
                ]
            };
        });

        it('should not return a location if image isn\'t inside viewer', () => {
            annotator.annotatedElement = document.createElement('div');
            const location = annotator.getLocationFromEvent({
                target: {
                    nodeName: 'not-annotated'
                }
            });
            expect(location).toBeNull();
        });

        it('should not return a location if no touch event is available and user is on a mobile device', () => {
            annotator.hasTouch = true;
            expect(annotator.getLocationFromEvent({ targetTouches: [] })).toBeNull();
        });

        it('should replace event with mobile touch event if user is on a mobile device', () => {
            annotator.hasTouch = true;
            annotator.getLocationFromEvent(event);
        });

        it('should not return a location if there are no touch event and the user is on a mobile device', () => {
            annotator.hasTouch = true;
            const location = annotator.getLocationFromEvent({
                target: {
                    nodeName: 'not-annotated'
                }
            });
            expect(location).toBeNull();

            event = {
                targetTouches: [
                    {
                        target: imageEl
                    }
                ]
            };
            expect(annotator.getLocationFromEvent(event)).toBeNull();
        });

        it('should not return a location if click event does not have coordinates', () => {
            event = { target: imageEl };
            expect(annotator.getLocationFromEvent(event)).toBeNull();
        });

        it('should return a valid point location if click is valid', () => {
            util.getScale = jest.fn().mockReturnValue(1);
            imageUtil.getLocationWithoutRotation = jest.fn().mockReturnValue([x, y]);
            imageEl.getBoundingClientRect = jest.fn().mockReturnValue({
                width: 100,
                height: 200,
                left: 0,
                top: 0
            });

            const location = annotator.getLocationFromEvent({
                clientX: x,
                clientY: y,
                target: imageEl
            });
            expect(location).toStrictEqual({
                x,
                y,
                imageEl,
                dimensions,
                page: 1
            });
        });
    });

    describe('createAnnotationThread()', () => {
        beforeEach(() => {
            util.areThreadParamsValid = jest.fn().mockReturnValue(true);
            annotator.handleValidationError = jest.fn();
        });

        it('should emit error and return undefined if thread fails to create', () => {
            const thread = annotator.createAnnotationThread([], {}, 'random');
            expect(thread).toBeUndefined();
            expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.error, annotator.localized.loadError);
        });

        it('should create, add point thread to internal map, and return it', () => {
            const thread = annotator.createAnnotationThread([], { page: 2 }, TYPES.point);

            expect(thread instanceof ImagePointThread).toBeTruthy();
            expect(annotator.handleValidationError).not.toBeCalled();
            expect(thread.location.page).toEqual(2);
            expect(annotator.emit).not.toBeCalledWith(ANNOTATOR_EVENT.error, annotator.localized.loadError);
        });

        it('should emit error and return undefined if thread params are invalid', () => {
            util.areThreadParamsValid = jest.fn().mockReturnValue(false);
            const thread = annotator.createAnnotationThread([], {}, TYPES.point);
            expect(thread instanceof ImagePointThread).toBeFalsy();
            expect(annotator.handleValidationError).toBeCalled();
        });

        it('should force page number 1 if the annotation was created without one', () => {
            const thread = annotator.createAnnotationThread([], {}, TYPES.point);

            expect(thread instanceof ImagePointThread).toBeTruthy();
            expect(annotator.handleValidationError).not.toBeCalled();
            expect(thread.location.page).toEqual(1);
            expect(annotator.emit).not.toBeCalledWith(ANNOTATOR_EVENT.error, annotator.localized.loadError);
        });

        it('should force page number 1 if the annotation was created wit page number -1', () => {
            const thread = annotator.createAnnotationThread([], { page: -1 }, TYPES.point);

            expect(thread instanceof ImagePointThread).toBeTruthy();
            expect(annotator.handleValidationError).not.toBeCalled();
            expect(thread.location.page).toEqual(1);
            expect(annotator.emit).not.toBeCalledWith(ANNOTATOR_EVENT.error, annotator.localized.loadError);
        });
    });

    describe('rotateAnnotations()', () => {
        beforeEach(() => {
            annotator.permissions.canAnnotate = true;
            util.hideElement = jest.fn();
            util.showElement = jest.fn();
            annotator.render = jest.fn();
            annotator.renderPage = jest.fn();

            annotator.modeButtons = {
                point: { selector: 'point_btn' }
            };

            annotator.modeControllers.point = {
                getButton: jest.fn()
            };
        });

        afterEach(() => {
            annotator.modeButtons = {};
        });

        it('should only render annotations if user cannot annotate', () => {
            annotator.permissions.canAnnotate = false;
            annotator.rotateAnnotations();
            expect(util.hideElement).not.toBeCalled();
            expect(util.showElement).not.toBeCalled();
            expect(annotator.render).toBeCalled();
        });

        it('should hide point annotation button if image is rotated', () => {
            annotator.rotateAnnotations(90);
            expect(util.hideElement).toBeCalled();
            expect(util.showElement).not.toBeCalled();
            expect(annotator.render).toBeCalled();
        });

        it('should show point annotation button if image is rotated', () => {
            annotator.rotateAnnotations();
            expect(util.hideElement).not.toBeCalled();
            expect(util.showElement).toBeCalled();
            expect(annotator.render).toBeCalled();
        });
    });
});
