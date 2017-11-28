import AnnotationThread from '../AnnotationThread';
import ImagePointDialog from './ImagePointDialog';
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

        if (this.state !== STATES.pending || (this.isMobile && Object.keys(this.annotations).length === 0)) {
            return;
        }

        this.showDialog();

        // Force dialogs to reposition on re-render
        if (!this.isMobile) {
            this.dialog.position();
        }
    }

    /**
     * Creates the image point annotation dialog for the thread.
     *
     * @override
     * @return {void}
     */
    createDialog() {
        this.dialog = new ImagePointDialog({
            annotatedElement: this.annotatedElement,
            container: this.container,
            annotations: this.annotations,
            location: this.location,
            locale: this.locale,
            canAnnotate: this.permissions.canAnnotate
        });
    }
}

export default ImagePointThread;
