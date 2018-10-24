import AnnotationThread from '../AnnotationThread';
import { showElement, shouldDisplayMobileUI, repositionCaret, findElement } from '../util';
import { getBrowserCoordinatesFromLocation } from './imageUtil';
import {
    STATES,
    ANNOTATION_POPOVER_CARET_HEIGHT,
    POINT_ANNOTATION_ICON_WIDTH,
    POINT_ANNOTATION_ICON_HEIGHT,
    POINT_ANNOTATION_ICON_DOT_HEIGHT
} from '../constants';

class ImagePointThread extends AnnotationThread {
    //--------------------------------------------------------------------------
    // Abstract Implementations
    //--------------------------------------------------------------------------

    /**
     * Gets the popover parent for image point threads. The popover parent
     * should not the image element but rather the annotatedElement
     *
     * @override
     * @return {HTMLElement} The correct parent based on mobile view or not
     */
    getPopoverParent() {
        return shouldDisplayMobileUI(this.container) ? this.container : this.annotatedElement;
    }

    /**
     * Shows the annotation indicator.
     *
     * @override
     * @return {void}
     */
    show() {
        const [browserX, browserY] = getBrowserCoordinatesFromLocation(this.location, this.annotatedElement);

        // Position and append to image
        this.element.style.left = `${browserX - POINT_ANNOTATION_ICON_WIDTH / 2}px`;
        this.element.style.top = `${browserY - POINT_ANNOTATION_ICON_HEIGHT + POINT_ANNOTATION_ICON_DOT_HEIGHT}px`;
        this.annotatedElement.appendChild(this.element);

        showElement(this.element);

        if (this.state !== STATES.pending) {
            return;
        }

        this.renderAnnotationPopover();
    }

    /**
     * Positions the dialog.
     *
     * @override
     * @return {void}
     */
    position = () => {
        if (shouldDisplayMobileUI(this.container)) {
            return;
        }

        const popoverEl = findElement(this.annotatedElement, '.ba-popover', this.renderAnnotationPopover);
        const dialogDimensions = popoverEl.getBoundingClientRect();
        const dialogWidth = dialogDimensions.width;

        // Get image tag inside viewer, based on page number. All images are page 1 by default.
        const imageEl = this.getPopoverParent();

        // Center middle of dialog with point - this coordinate is with respect to the page
        const threadIconLeftX = this.element.offsetLeft + POINT_ANNOTATION_ICON_WIDTH / 2;
        let dialogLeftX = threadIconLeftX - dialogWidth / 2;

        // Adjusts Y position for transparent top border
        const dialogTopY =
            this.element.offsetTop +
            POINT_ANNOTATION_ICON_HEIGHT +
            POINT_ANNOTATION_ICON_DOT_HEIGHT +
            ANNOTATION_POPOVER_CARET_HEIGHT;

        // Only reposition if one side is past page boundary - if both are,
        // just center the dialog and cause scrolling since there is nothing
        // else we can do
        const pageWidth =
            imageEl.clientWidth > this.annotatedElement.clientWidth
                ? imageEl.clientWidth
                : this.annotatedElement.clientWidth;
        dialogLeftX = repositionCaret(popoverEl, dialogLeftX, dialogWidth, threadIconLeftX, pageWidth);

        // Position the dialog
        popoverEl.style.left = `${dialogLeftX}px`;

        const dialogPos = this.flipDialog(dialogTopY, this.container.clientHeight);
        popoverEl.style.top = dialogPos.top;
        popoverEl.style.bottom = dialogPos.bottom;
    };
}

export default ImagePointThread;
