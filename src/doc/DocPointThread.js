import AnnotationThread from '../AnnotationThread';
import DocPointDialog from './DocPointDialog';
import * as util from '../util';
import * as docUtil from './docUtil';
import { STATES } from '../constants';

const PAGE_PADDING_TOP = 15;
const POINT_ANNOTATION_ICON_HEIGHT = 31;
const POINT_ANNOTATION_ICON_DOT_HEIGHT = 8;
const POINT_ANNOTATION_ICON_WIDTH = 24;

class DocPointThread extends AnnotationThread {
    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * Shows the appropriate annotation dialog for this thread.
     *
     * @override
     * @return {void}
     */
    showDialog() {
        // Don't show dialog if user can annotate and there is a current selection
        if (this.permissions.canAnnotate && docUtil.isSelectionPresent()) {
            return;
        }

        super.showDialog();
    }

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
        const pageEl =
            this.annotatedElement.querySelector(`[data-page-number="${this.location.page}"]`) || this.annotatedElement;
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

        this.showDialog();
    }

    /**
     * Creates the document point annotation dialog for the thread.
     *
     * @override
     * @return {void}
     */
    createDialog() {
        this.dialog = new DocPointDialog({
            annotatedElement: this.annotatedElement,
            container: this.container,
            annotations: this.annotations,
            locale: this.locale,
            location: this.location,
            isMobile: this.isMobile,
            hasTouch: this.hasTouch,
            canAnnotate: this.permissions.canAnnotate
        });
    }
}

export default DocPointThread;
