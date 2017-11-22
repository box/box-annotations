import Annotator from '../Annotator';
import ImagePointThread from './ImagePointThread';
import * as annotatorUtil from '../annotatorUtil';
import * as imageAnnotatorUtil from './imageAnnotatorUtil';
import { ANNOTATOR_EVENT, TYPES } from '../annotationConstants';

const IMAGE_NODE_NAME = 'img';
// Selector for image container OR multi-image container
const ANNOTATED_ELEMENT_SELECTOR = '.bp-image, .bp-images-wrapper';

class ImageAnnotator extends Annotator {
    //--------------------------------------------------------------------------
    // Abstract Implementations
    //--------------------------------------------------------------------------

    /**
     * Determines the annotated element in the viewer
     *
     * @param {HTMLElement} containerEl - Container element for the viewer
     * @return {HTMLElement} Annotated element in the viewer
     */
    getAnnotatedEl(containerEl) {
        return containerEl.querySelector(ANNOTATED_ELEMENT_SELECTOR);
    }

    /**
     * Returns an annotation location on an image from the DOM event or null
     * if no correct annotation location can be inferred from the event. For
     * point annotations, we return the (x, y) coordinates for the point
     * with the top left corner of the image as the origin.
     *
     * @override
     * @param {Event} event - DOM event
     * @return {Object|null} Location object
     */
    getLocationFromEvent(event) {
        let location = null;

        let clientEvent = event;
        if (this.isMobile) {
            if (!event.targetTouches || event.targetTouches.length === 0) {
                return location;
            }
            clientEvent = event.targetTouches[0];
        }

        // Get image tag inside viewer
        const imageEl = clientEvent.target;
        if (imageEl.nodeName.toLowerCase() !== IMAGE_NODE_NAME) {
            return location;
        }

        // If no image page was selected, ignore, as all images have a page number.
        const { page } = annotatorUtil.getPageInfo(imageEl);

        // Location based only on image position
        const imageDimensions = imageEl.getBoundingClientRect();
        let [x, y] = [clientEvent.clientX - imageDimensions.left, clientEvent.clientY - imageDimensions.top];

        // Do not create annotation if event doesn't have coordinates
        if (Number.isNaN(x) || Number.isNaN(y)) {
            this.emit(ANNOTATOR_EVENT.error, this.localized.createError);
            return location;
        }

        // Scale location coordinates according to natural image size
        const scale = annotatorUtil.getScale(this.annotatedElement);
        const rotation = Number(imageEl.getAttribute('data-rotation-angle'));
        [x, y] = imageAnnotatorUtil.getLocationWithoutRotation(x / scale, y / scale, rotation, imageDimensions, scale);

        // We save the dimensions of the annotated element so we can
        // compare to the element being rendered on and scale as appropriate
        const dimensions = {
            x: imageDimensions.width / scale,
            y: imageDimensions.height / scale
        };

        location = {
            x,
            y,
            imageEl,
            dimensions,
            page
        };

        return location;
    }

    /**
     * Creates the proper type of thread, adds it to in-memory map, and returns
     * it.
     *
     * @override
     * @param {Object} annotations - Annotations in thread
     * @param {Object} location - Location object
     * @param {string} [type] - Optional annotation type
     * @return {AnnotationThread} Created annotation thread
     */
    createAnnotationThread(annotations, location, type) {
        let thread;

        // Corrects any image annotation page number to 1 instead of -1
        const fixedLocation = location;
        if (!fixedLocation.page || fixedLocation.page < 0) {
            fixedLocation.page = 1;
        }

        const threadParams = this.getThreadParams(annotations, location, type);
        if (!annotatorUtil.areThreadParamsValid(threadParams)) {
            this.handleValidationError();
            return thread;
        }

        if (type === TYPES.point) {
            thread = new ImagePointThread(threadParams);
        }

        if (!thread) {
            this.emit(ANNOTATOR_EVENT.error, this.localized.loadError);
        }

        return thread;
    }
}

export default ImageAnnotator;
