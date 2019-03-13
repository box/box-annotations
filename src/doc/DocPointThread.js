// @flow
import AnnotationThread from '../AnnotationThread';
import { getPageEl, showElement, findElement, repositionCaret, shouldDisplayMobileUI, isInUpperHalf } from '../util';
import { getBrowserCoordinatesFromLocation } from './docUtil';
import {
    STATES,
    SELECTOR_ANNOTATION_POPOVER,
    ANNOTATION_POPOVER_CARET_HEIGHT,
    CLASS_FLIPPED_POPOVER
} from '../constants';

const PAGE_PADDING_TOP = 15;
const POINT_ANNOTATION_ICON_HEIGHT = 31;
const POINT_ANNOTATION_ICON_DOT_HEIGHT = 8;
const POINT_ANNOTATION_ICON_WIDTH = 24;

class DocPointThread extends AnnotationThread {
    /**
     * Shows the annotation indicator.
     *
     * @return {void}
     */
    show() {
        // $FlowFixMe
        const pageEl = getPageEl(this.annotatedElement, this.location.page);
        const [browserX, browserY] = getBrowserCoordinatesFromLocation(this.location, this.annotatedElement);

        // Position and append to page
        this.element.style.left = `${browserX - POINT_ANNOTATION_ICON_WIDTH / 2}px`;
        // Add 15px for vertical padding on page
        this.element.style.top = `${browserY -
            POINT_ANNOTATION_ICON_HEIGHT +
            POINT_ANNOTATION_ICON_DOT_HEIGHT / 2 +
            PAGE_PADDING_TOP}px`;
        pageEl.appendChild(this.element);

        showElement(this.element);

        if (this.state !== STATES.pending) {
            return;
        }

        this.renderAnnotationPopover();
    }

    /**
     * Positions the dialog.
     *
     * @return {void}
     */
    position = () => {
        if (shouldDisplayMobileUI(this.container)) {
            return;
        }

        const pageEl = this.getPopoverParent();
        const popoverEl = findElement(this.annotatedElement, SELECTOR_ANNOTATION_POPOVER, this.renderAnnotationPopover);
        const dialogDimensions = popoverEl.getBoundingClientRect();
        const dialogWidth = dialogDimensions.width;
        const pageDimensions = pageEl.getBoundingClientRect();

        // Center middle of dialog with point - this coordinate is with respect to the page
        const threadIconLeftX = this.element.offsetLeft + POINT_ANNOTATION_ICON_WIDTH / 2;
        let dialogLeftX = threadIconLeftX - dialogWidth / 2;

        const isUpperHalf = isInUpperHalf(this.element, pageEl);

        const flippedPopoverOffset = isUpperHalf
            ? 0
            : popoverEl.getBoundingClientRect().height +
              POINT_ANNOTATION_ICON_DOT_HEIGHT * 2 +
              ANNOTATION_POPOVER_CARET_HEIGHT;

        // Adjusts Y position for transparent top border
        const dialogTopY =
            this.element.offsetTop +
            POINT_ANNOTATION_ICON_HEIGHT +
            POINT_ANNOTATION_ICON_DOT_HEIGHT -
            flippedPopoverOffset;

        if (flippedPopoverOffset) {
            popoverEl.classList.add(CLASS_FLIPPED_POPOVER);
            this.element.classList.add(CLASS_FLIPPED_POPOVER);
        } else {
            popoverEl.classList.remove(CLASS_FLIPPED_POPOVER);
            this.element.classList.remove(CLASS_FLIPPED_POPOVER);
        }

        // Only reposition if one side is past page boundary - if both are,
        // just center the dialog and cause scrolling since there is nothing
        // else we can do
        dialogLeftX = repositionCaret(
            popoverEl,
            dialogLeftX,
            dialogWidth,
            threadIconLeftX,
            pageDimensions.width,
            !isUpperHalf
        );

        // Position the dialog
        popoverEl.style.left = `${dialogLeftX}px`;
        popoverEl.style.top = `${dialogTopY}px`;
        this.scrollIntoView(dialogTopY);
    };
}

export default DocPointThread;
