import AnnotationThread from '../AnnotationThread';
import * as util from '../util';
import * as imageUtil from './imageUtil';
import { STATES } from '../constants';

const POINT_ANNOTATION_ICON_HEIGHT = 31;
const POINT_ANNOTATION_ICON_DOT_HEIGHT = 8;
const POINT_ANNOTATION_ICON_WIDTH = 24;

class ImagePointThread extends AnnotationThread {
    //--------------------------------------------------------------------------
    // Abstract Implementations
    //--------------------------------------------------------------------------

    /**
     * Shows the annotation indicator.
     *
     * @override
     * @return {void}
     */
    show() {
        const [browserX, browserY] = imageUtil.getBrowserCoordinatesFromLocation(this.location, this.annotatedElement);

        // Position and append to image
        this.element.style.left = `${browserX - POINT_ANNOTATION_ICON_WIDTH / 2}px`;
        this.element.style.top = `${browserY - POINT_ANNOTATION_ICON_HEIGHT + POINT_ANNOTATION_ICON_DOT_HEIGHT}px`;
        this.annotatedElement.appendChild(this.element);

        util.showElement(this.element);

        if (this.state !== STATES.pending || (this.isMobile && this.comments.length === 0)) {
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
    position() {
        const popoverEl = util.findElement(this.annotatedElement, '.ba-popover', this.renderAnnotationPopover);
        const dialogDimensions = popoverEl.getBoundingClientRect();
        const dialogWidth = dialogDimensions.width;

        // Get image tag inside viewer, based on page number. All images are page 1 by default.
        const imageEl = this.annotatedElement.querySelector(`[data-page-number="${this.location.page}"]`);

        // Center middle of dialog with point - this coordinate is with respect to the page
        const threadIconLeftX = this.threadEl.offsetLeft + POINT_ANNOTATION_ICON_WIDTH / 2;
        let dialogLeftX = threadIconLeftX - dialogWidth / 2;

        // Adjusts Y position for transparent top border
        const dialogTopY = this.threadEl.offsetTop + POINT_ANNOTATION_ICON_HEIGHT;

        // Only reposition if one side is past page boundary - if both are,
        // just center the dialog and cause scrolling since there is nothing
        // else we can do
        const pageWidth =
            imageEl.clientWidth > this.annotatedElement.clientWidth
                ? imageEl.clientWidth
                : this.annotatedElement.clientWidth;
        dialogLeftX = util.repositionCaret(popoverEl, dialogLeftX, dialogWidth, threadIconLeftX, pageWidth);

        // Position the dialog
        popoverEl.style.left = `${dialogLeftX}px`;

        const dialogPos = this.flipDialog(dialogTopY, this.container.clientHeight);
        popoverEl.style.top = dialogPos.top;
        popoverEl.style.bottom = dialogPos.bottom;
    }
}

export default ImagePointThread;
