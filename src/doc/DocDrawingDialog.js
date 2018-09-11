import AnnotationDialog from '../AnnotationDialog';
import * as util from '../util';
import * as constants from '../constants';
import { ICON_DRAW_SAVE, ICON_DRAW_DELETE } from '../icons/icons';

class DocDrawingDialog extends AnnotationDialog {
    /** @property {boolean} Whether or not the dialog is visible */
    visible = false;

    /**
     * [constructor]
     *
     * @param {AnnotationDialogData} data Data for constructing drawing dialog
     * @return {DocDrawingDialog} Drawing dialog instance
     */
    constructor(data) {
        super(data);

        this.postDrawing = this.postDrawing.bind(this);
        this.deleteAnnotation = this.deleteAnnotation.bind(this);
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        this.unbindDOMListeners();
        this.removeAllListeners();

        if (!this.element) {
            return;
        }

        this.element.removeEventListener('click', util.prevDefAndStopProp);
        if (this.pageEl && this.pageEl.contains(this.element)) {
            this.pageEl.removeChild(this.element);
        }

        this.element = null;
    }

    /**
     * Returns whether or not the dialog is able to be seen
     *
     * @public
     * @return {boolean} Whether or not the dialog is able to be seen
     */
    isVisible() {
        return this.visible;
    }

    /**
     * Save the drawing thread upon clicking save. Will cause a soft commit.
     *
     * @override
     * @protected
     * @param {Annotation} annotation Annotation to add
     * @return {void}
     */
    addAnnotation(annotation) {
        if (!this.element) {
            this.setup([annotation]);
        }
        this.assignDrawingLabel(annotation);
    }

    /**
     * Empty stub to avoid unexpected behavior. Removing a drawing annotation can only be done by deleting the thread.
     *
     * @override
     * @protected
     * @return {void}
     */
    removeAnnotation() {}

    /**
     * Bind dialog button listeners
     *
     * @protected
     * @return {void}
     */
    bindDOMListeners() {
        if (this.commitButtonEl) {
            if (!this.isMobile) {
                this.commitButtonEl.addEventListener('click', this.postDrawing);
            }

            if (this.hasTouch) {
                this.commitButtonEl.addEventListener('touchend', this.postDrawing);
            }
        }

        if (this.deleteButtonEl) {
            if (!this.isMobile) {
                this.deleteButtonEl.addEventListener('click', this.deleteAnnotation);
            }

            if (this.hasTouch) {
                this.deleteButtonEl.addEventListener('touchend', this.deleteAnnotation);
            }
        }
    }

    /**
     * Unbind dialog button listeners
     *
     * @protected
     * @return {void}
     */
    unbindDOMListeners() {
        if (this.commitButtonEl) {
            this.commitButtonEl.removeEventListener('click', this.postDrawing);
            this.commitButtonEl.removeEventListener('touchend', this.postDrawing);
        }

        if (this.deleteButtonEl) {
            this.deleteButtonEl.removeEventListener('click', this.deleteAnnotation);
            this.deleteButtonEl.removeEventListener('touchend', this.deleteAnnotation);
        }
    }

    /**
     * Sets up the drawing dialog element.
     *
     * @protected
     * @param {Object} [annotations] Annotations to show in the dialog
     * @return {void}
     */
    setup(annotations = []) {
        // Create outermost element container
        this.element = document.createElement('div');
        this.element.addEventListener('click', util.prevDefAndStopProp);
        this.element.classList.add(constants.CLASS_ANNOTATION_DIALOG);

        // Create the dialog element consisting of a label, save, and delete button
        this.drawingDialogEl = this.generateDialogEl(annotations);

        // Set the newly created buttons from the dialog element
        this.commitButtonEl = this.drawingDialogEl.querySelector(constants.SELECTOR_ADD_DRAWING_BTN);
        this.deleteButtonEl = this.drawingDialogEl.querySelector(constants.SELECTOR_DELETE_DRAWING_BTN);

        this.bindDOMListeners();

        const firstAnnotation = annotations[0];
        if (firstAnnotation) {
            this.addAnnotation(firstAnnotation);
        }

        this.element.appendChild(this.drawingDialogEl);
    }

    /**
     * Position the drawing dialog with an x,y browser coordinate
     *
     * @protected
     * @param {number} x The x position to position the dialog with
     * @param {number} y The y position to position the dialog with
     * @return {void}
     */
    position(x, y) {
        if (!this.pageEl) {
            this.pageEl = this.annotatedElement.querySelector(`[data-page-number="${this.location.page}"]`);
        }

        if (!this.element) {
            this.setup();
        }

        // Reinsert when the dialog is removed from the page
        if (!this.pageEl.contains(this.element)) {
            this.pageEl.appendChild(this.element);
        }

        // NOTE: (@pramodsum) Add the annotationDialog.flipDialog implementation here
        // Show dialog so we can get width
        const clientRect = this.element.getBoundingClientRect();
        this.element.style.left = `${x - clientRect.width}px`;
        this.element.style.top = `${y}px`;
    }

    /**
     * Hide the dialog in the browser
     *
     * @protected
     * @return {void}
     */
    hide() {
        util.hideElement(this.element);
        this.visible = false;
    }

    /**
     * Display the dialog in the browser
     *
     * @protected
     * @return {void}
     */
    show() {
        util.showElement(this.element);
        this.visible = true;
    }

    /**
     * Generate the dialog HTMLElement consisting of a label, save, and delete button
     *
     * @private
     * @param {Array} annotations Array of annotations. A non-empty array means there are saved drawings.
     * @return {HTMLElement} The drawing dialog element
     */
    generateDialogEl(annotations) {
        const firstAnnotation = annotations[0];
        const canCommit = !firstAnnotation;
        const canDelete =
            canCommit || (firstAnnotation && firstAnnotation.permissions && firstAnnotation.permissions.can_delete);

        const drawingButtonsEl = document.createElement('span');
        drawingButtonsEl.classList.add(constants.CLASS_ANNOTATION_DRAWING_BTNS);

        const labelTemplate = document.createElement('span');
        labelTemplate.classList.add(constants.CLASS_ANNOTATION_DRAWING_LABEL);
        labelTemplate.classList.add(constants.CLASS_HIDDEN);
        drawingButtonsEl.appendChild(labelTemplate);

        if (canCommit) {
            const commitButton = util.generateBtn(
                [constants.CLASS_BUTTON_PLAIN, constants.CLASS_ADD_DRAWING_BTN],
                this.localized.drawSave,
                `${ICON_DRAW_SAVE} ${this.localized.saveButton}`
            );
            drawingButtonsEl.appendChild(commitButton);
        }

        if (canDelete) {
            const deleteButton = util.generateBtn(
                [constants.CLASS_BUTTON_PLAIN, constants.CLASS_DELETE_DRAWING_BTN],
                this.localized.drawDelete,
                `${ICON_DRAW_DELETE} ${this.localized.deleteButton}`
            );
            drawingButtonsEl.appendChild(deleteButton);
        }

        const drawingDialogEl = document.createElement('div');
        drawingDialogEl.classList.add(constants.CLASS_ANNOTATION_DRAWING_DIALOG);
        drawingDialogEl.appendChild(drawingButtonsEl);

        return drawingDialogEl;
    }

    /**
     * Fill out the drawing dialog label with the name of the user who drew the drawing. Will use anonymous if
     * the username does not exist.
     *
     * @private
     * @param {Annotation} annotation The annotation data to populate the label with.
     * @return {void}
     */
    assignDrawingLabel(annotation) {
        if (!annotation || !this.drawingDialogEl || annotation.user.id === '0') {
            return;
        }

        const drawingLabelEl = this.drawingDialogEl.querySelector(`.${constants.CLASS_ANNOTATION_DRAWING_LABEL}`);
        drawingLabelEl.textContent = util.replacePlaceholders(this.localized.whoDrew, [annotation.user.name]);

        util.showElement(drawingLabelEl);
    }

    /**
     * Broadcasts message to save the drawing in progress
     *
     * @private
     * @param {event} event The event object from an event emitter
     * @return {void}
     */
    postDrawing(event) {
        event.stopPropagation();
        event.preventDefault();
        this.emit('annotationcreate');
    }

    /**
     * Broadcasts message to delete a drawing.
     *
     * @private
     * @param {event} event The event object from an event emitter
     * @return {void}
     */
    deleteAnnotation(event) {
        event.stopPropagation();
        event.preventDefault();
        this.emit('annotationdelete');
    }
}

export default DocDrawingDialog;
