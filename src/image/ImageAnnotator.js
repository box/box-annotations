// @flow
import Annotator from '../Annotator';
import * as util from '../util';
import * as imageUtil from './imageUtil';
import { ANNOTATOR_EVENT, TYPES } from '../constants';

const IMAGE_NODE_NAME = 'img';
// Selector for image container OR multi-image container
const ANNOTATED_ELEMENT_SELECTOR = '.bp-image, .bp-images-wrapper';

class ImageAnnotator extends Annotator {
    /** @inheritdoc */
    getAnnotatedEl(containerEl: HTMLElement): ?HTMLElement {
        return containerEl.querySelector(ANNOTATED_ELEMENT_SELECTOR);
    }

    /**
     * Returns an annotation location on an image from the DOM event or null
     * if no correct annotation location can be inferred from the event. For
     * point annotations, we return the (x, y) coordinates for the point
     * with the top left corner of the image as the origin.
     *
     * @param {Event} event - DOM event
     * @return {Location|null} Location object
     */
    getLocationFromEvent = (event: EventEmitter): ?Location => {
        let location = null;

        let clientEvent = event;
        if (this.hasTouch) {
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

        // If no image page was selected, ignore, as all images have a page number
        const { page } = util.getPageInfo(imageEl);

        // Location based only on image position
        const imageDimensions = imageEl.getBoundingClientRect();
        let [x, y] = [clientEvent.clientX - imageDimensions.left, clientEvent.clientY - imageDimensions.top];

        // Do not create annotation if event doesn't have coordinates
        if (Number.isNaN(x) || Number.isNaN(y)) {
            this.emit(ANNOTATOR_EVENT.error, this.localized.createError);
            return location;
        }

        // Scale location coordinates according to natural image size
        const scale = util.getScale(this.annotatedElement);
        const rotation = Number(imageEl.getAttribute('data-rotation-angle'));
        [x, y] = imageUtil.getLocationWithoutRotation(x / scale, y / scale, rotation, imageDimensions, scale);

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
    };

    /** @inheritdoc */
    scaleAnnotations(data: Object) {
        this.setScale(data.scale);
        this.rotateAnnotations(data.rotationAngle, data.pageNum);
    }

    /**
     * Rotates annotations. Hides point annotation mode button if rotated
     *
     * @param {number} [rotationAngle] - current angle image is rotated
     * @param {number} [pageNum] - Page number
     * @return {void}
     */
    rotateAnnotations(rotationAngle: number = 0, pageNum: number = 0) {
        // Only render a specific page's annotations unless no page number
        // is specified
        if (pageNum) {
            this.renderPage(pageNum);
        } else {
            this.render();
        }

        // Only show/hide point annotation button if user has the
        // appropriate permissions
        const controller = this.modeControllers[TYPES.point];
        if (!this.permissions.can_annotate || !controller) {
            return;
        }

        // Hide create annotations button if image is rotated
        const pointButtonSelector = this.modeButtons[TYPES.point].selector;
        const pointAnnotateButton = controller.getButton(pointButtonSelector);
        if (rotationAngle !== 0) {
            util.hideElement(pointAnnotateButton);
        } else {
            util.showElement(pointAnnotateButton);
        }
    }

    /** @inheritdoc */
    bindDOMListeners() {
        if (this.annotatedElement) {
            this.annotatedElement.addEventListener('mouseup', this.hideAnnotations);
        }
        super.bindDOMListeners();
    }

    /** @inheritdoc */
    unbindDOMListeners() {
        if (this.annotatedElement) {
            this.annotatedElement.removeEventListener('mouseup', this.hideAnnotations);
        }
        super.bindDOMListeners();
    }
}

export default ImageAnnotator;
