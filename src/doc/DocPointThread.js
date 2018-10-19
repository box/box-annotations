import AnnotationThread from '../AnnotationThread';
import * as util from '../util';
import * as docUtil from './docUtil';
import { STATES } from '../constants';

const PAGE_PADDING_TOP = 15;
const POINT_ANNOTATION_ICON_HEIGHT = 31;
const POINT_ANNOTATION_ICON_DOT_HEIGHT = 8;
const POINT_ANNOTATION_ICON_WIDTH = 24;

class DocPointThread extends AnnotationThread {
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
        const pageEl = this.getPopoverParent();
        const [browserX, browserY] = docUtil.getBrowserCoordinatesFromLocation(this.location, this.annotatedElement);

        // Position and append to page
        this.element.style.left = `${browserX - POINT_ANNOTATION_ICON_WIDTH / 2}px`;
        // Add 15px for vertical padding on page
        this.element.style.top = `${browserY -
            POINT_ANNOTATION_ICON_HEIGHT +
            POINT_ANNOTATION_ICON_DOT_HEIGHT / 2 +
            PAGE_PADDING_TOP}px`;
        pageEl.appendChild(this.element);

        util.showElement(this.element);

        if (this.state !== STATES.pending || (this.isMobile && this.annotations.length === 0)) {
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
        if (this.isMobile) {
            return;
        }

        const pageEl = this.getPopoverParent();

        const popoverEl = util.findElement(this.annotatedElement, '.ba-popover', this.renderAnnotationPopover);
        const dialogDimensions = popoverEl.getBoundingClientRect();
        const dialogWidth = dialogDimensions.width;
        const pageDimensions = pageEl.getBoundingClientRect();

        // Center middle of dialog with point - this coordinate is with respect to the page
        const threadIconLeftX = this.element.offsetLeft + POINT_ANNOTATION_ICON_WIDTH / 2;
        let dialogLeftX = threadIconLeftX - dialogWidth / 2;

        // Adjusts Y position for transparent top border
        const dialogTopY = this.element.offsetTop + POINT_ANNOTATION_ICON_HEIGHT;

        // Only reposition if one side is past page boundary - if both are,
        // just center the dialog and cause scrolling since there is nothing
        // else we can do
        dialogLeftX = util.repositionCaret(popoverEl, dialogLeftX, dialogWidth, threadIconLeftX, pageDimensions.width);

        // Position the dialog
        popoverEl.style.left = `${dialogLeftX}px`;

        popoverEl.style.top = dialogTopY;
    };
}

export default DocPointThread;
