// @flow
import AnnotationThread from '../AnnotationThread';
import { showElement, shouldDisplayMobileUI, repositionCaret, findElement, isInUpperHalf } from '../util';
import { getBrowserCoordinatesFromLocation } from './imageUtil';
import {
    STATES,
    ANNOTATION_POPOVER_CARET_HEIGHT,
    POINT_ANNOTATION_ICON_WIDTH,
    POINT_ANNOTATION_ICON_HEIGHT,
    POINT_ANNOTATION_ICON_DOT_HEIGHT,
    SELECTOR_ANNOTATION_POPOVER,
    CLASS_FLIPPED_POPOVER,
} from '../constants';

class ImagePointThread extends AnnotationThread {
    /**
     * Gets the popover parent for image point threads. The popover parent
     * should be not the image element but rather the annotatedElement
     *
     * @override
     * @return {HTMLElement} The correct parent based on mobile view or not
     */
    getPopoverParent() {
        return shouldDisplayMobileUI(this.container) ? this.container : this.annotatedElement;
    }

    /** @inheritdoc */
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

    /** @inheritdoc */
    position = () => {
        if (shouldDisplayMobileUI(this.container)) {
            return;
        }

        const popoverEl = findElement(this.annotatedElement, SELECTOR_ANNOTATION_POPOVER, this.renderAnnotationPopover);
        const dialogDimensions = popoverEl.getBoundingClientRect();
        const dialogWidth = dialogDimensions.width;

        // Center middle of dialog with point - this coordinate is with respect to the page
        const threadIconLeftX = this.element.offsetLeft + POINT_ANNOTATION_ICON_WIDTH / 2;
        let dialogLeftX = threadIconLeftX - dialogWidth / 2;

        const popoverParentEl = this.getPopoverParent();
        const isUpperHalf = isInUpperHalf(this.element, popoverParentEl);
        const flippedPopoverOffset = isUpperHalf
            ? 0
            : popoverEl.getBoundingClientRect().height +
              POINT_ANNOTATION_ICON_DOT_HEIGHT * 2 +
              ANNOTATION_POPOVER_CARET_HEIGHT;

        const dialogTopY =
            this.element.offsetTop +
            POINT_ANNOTATION_ICON_HEIGHT +
            POINT_ANNOTATION_ICON_DOT_HEIGHT -
            flippedPopoverOffset;

        if (flippedPopoverOffset) {
            popoverEl.classList.add(CLASS_FLIPPED_POPOVER);
        }

        // Only reposition if one side is past page boundary - if both are,
        // just center the dialog and cause scrolling since there is nothing
        // else we can do
        const pageWidth =
            popoverParentEl.clientWidth > this.annotatedElement.clientWidth
                ? popoverParentEl.clientWidth
                : this.annotatedElement.clientWidth;
        dialogLeftX = repositionCaret(popoverEl, dialogLeftX, dialogWidth, threadIconLeftX, pageWidth, !isUpperHalf);

        // Position the dialog
        popoverEl.style.left = `${dialogLeftX}px`;
        popoverEl.style.top = `${dialogTopY}px`;
        this.scrollIntoView(dialogTopY);
    };
}

export default ImagePointThread;
