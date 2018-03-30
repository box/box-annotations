import AnnotationDialog from '../AnnotationDialog';
import * as util from '../util';
import * as docUtil from './docUtil';
import { ICON_HIGHLIGHT, ICON_HIGHLIGHT_COMMENT } from '../icons/icons';
import * as constants from '../constants';

const CLASS_HIGHLIGHT_DIALOG = 'bp-highlight-dialog';
const CLASS_TEXT_HIGHLIGHTED = 'bp-is-text-highlighted';
const CLASS_HIGHLIGHT_LABEL = 'bp-annotation-highlight-label';

const HIGHLIGHT_DIALOG_HEIGHT = 38;
const PAGE_PADDING_BOTTOM = 15;
const PAGE_PADDING_TOP = 15;

class DocHighlightDialog extends AnnotationDialog {
    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * @inheritdoc
     */
    constructor(data) {
        super(data);

        // Explicitly bind listeners
        this.mousedownHandler = this.mousedownHandler.bind(this);
    }

    /**
     * Saves an annotation with the associated text or blank if only
     * highlighting. Only adds an annotation to the dialog if it contains text.
     * The annotation is still added to the thread on the server side.
     *
     * @override
     * @param {Annotation} annotation Annotation to add
     * @return {void}
     */
    addAnnotation(annotation) {
        // If annotation is blank then display who highlighted the text
        // Will be displayed as '{name} highlighted'
        if (annotation.text === '' && annotation.user.id !== '0') {
            const highlightLabelEl = this.highlightDialogEl.querySelector(`.${CLASS_HIGHLIGHT_LABEL}`);
            highlightLabelEl.textContent = util.replacePlaceholders(this.localized.whoHighlighted, [
                annotation.user.name
            ]);
            util.showElement(highlightLabelEl);

            // Only reposition if mouse is still hovering over the dialog and not mobile
            if (!this.isMobile) {
                this.position();
            }
        }

        super.addAnnotation(annotation);
    }

    /**
     * Removes an annotation from the dialog.
     *
     * @param {string} annotationID ID of annotation to remove
     * @return {void}
     */
    removeAnnotation(annotationID) {
        const annotationEl = this.commentsDialogEl.querySelector(`[data-annotation-id="${annotationID}"]`);
        if (annotationEl) {
            annotationEl.parentNode.removeChild(annotationEl);
            this.deactivateReply(); // Deactivate reply area and focus
        }
    }

    /** @inheritdoc */
    postAnnotation(textInput) {
        const annotationTextEl = this.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
        const text = textInput || annotationTextEl.value;
        if (text.trim() === '') {
            return;
        }

        // Convert from plain highlight to comment
        const headerEl = this.element.querySelector(constants.SELECTOR_MOBILE_DIALOG_HEADER);
        if (headerEl) {
            headerEl.classList.remove(constants.CLASS_HIDDEN);
            this.element.classList.remove(constants.CLASS_ANNOTATION_PLAIN_HIGHLIGHT);
        }

        super.postAnnotation(textInput);
    }

    /**
     * Set the state of the dialog so comments are hidden, if they're currently shown.
     *
     * @public
     * @return {void}
     */
    hideCommentsDialog() {
        if (!this.commentsDialogEl || !this.highlightDialogEl) {
            return;
        }

        // Displays comments dialog and hides highlight annotations button
        const commentsDialogIsHidden = this.commentsDialogEl.classList.contains(constants.CLASS_HIDDEN);
        if (commentsDialogIsHidden) {
            return;
        }

        util.hideElement(this.commentsDialogEl);

        this.element.classList.add(CLASS_HIGHLIGHT_DIALOG);
        util.showElement(this.highlightDialogEl);
        this.hasComments = false;
    }

    /**
     * Emit the message to create a highlight and render it.
     *
     * @public
     * @return {void}
     */
    drawAnnotation() {
        this.emit('annotationdraw');
        this.toggleHighlight();
    }

    //--------------------------------------------------------------------------
    // Abstract Implementations
    //--------------------------------------------------------------------------

    /**
     * Positions the dialog.
     *
     * @override
     * @return {void}
     */
    position() {
        // Position it below lower right corner or center of the highlight - we need
        // to reposition every time since the DOM could have changed from
        // zooming
        const pageEl = this.annotatedElement.querySelector(`[data-page-number="${this.location.page}"]`);
        const pageDimensions = pageEl.getBoundingClientRect();
        const pageHeight = pageDimensions.height - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM;

        const [browserX, browserY] = this.getScaledPDFCoordinates(pageDimensions, pageHeight);
        pageEl.appendChild(this.element);

        const highlightDialogWidth = this.getDialogWidth();

        let dialogX = browserX - highlightDialogWidth / 2; // Center dialog
        // Shorten extra transparent border top if showing comments dialog
        let dialogY = this.hasComments ? browserY - 10 : browserY;
        dialogY -= 10;
        if (this.hasComments) {
            this.element.style.borderTopWidth = '30px';
        }

        // Only reposition if one side is past page boundary - if both are,
        // just center the dialog and cause scrolling since there is nothing
        // else we can do
        dialogX = util.repositionCaret(this.element, dialogX, highlightDialogWidth, browserX, pageDimensions.width);

        if (dialogY < 0) {
            dialogY = 0;
        } else if (dialogY + HIGHLIGHT_DIALOG_HEIGHT > pageHeight) {
            dialogY = pageHeight - HIGHLIGHT_DIALOG_HEIGHT;
        }

        this.element.style.left = `${dialogX}px`;
        this.element.style.top = `${dialogY + PAGE_PADDING_TOP}px`;
        this.fitDialogHeightInPage();
        util.showElement(this.element);
    }

    /**
     * Toggles between the highlight annotations buttons dialog and the
     * highlight comments dialog. Dialogs are toggled based on whether the
     * highlight annotation has text comments or not.
     *
     * @override
     * @return {void}
     */
    toggleHighlightDialogs() {
        if (!this.commentsDialogEl || !this.highlightDialogEl) {
            return;
        }

        const commentsDialogIsHidden = this.commentsDialogEl.classList.contains(constants.CLASS_HIDDEN);

        // Displays comments dialog and hides highlight annotations button
        if (commentsDialogIsHidden) {
            this.element.classList.remove(CLASS_HIGHLIGHT_DIALOG);
            util.hideElement(this.highlightDialogEl);

            this.element.classList.add(constants.CLASS_ANNOTATION_DIALOG);
            util.showElement(this.commentsDialogEl);
            this.hasComments = true;
            // Activate comments textarea
            const textAreaEl = this.dialogEl.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
            textAreaEl.classList.add(constants.CLASS_ACTIVE);
        } else {
            // Displays the highlight and comment buttons dialog and
            // hides the comments dialog
            this.element.classList.remove(constants.CLASS_ANNOTATION_DIALOG);
            util.hideElement(this.commentsDialogEl);

            this.element.classList.add(CLASS_HIGHLIGHT_DIALOG);
            util.showElement(this.highlightDialogEl);
            this.hasComments = false;
        }

        // Reposition dialog
        if (!this.isMobile) {
            this.position();
        }
    }

    /**
     * Toggles between the "Add a comment here" and "Reply" text areas in the
     * comments dialog. This accounts for when a blank highlight is created and
     * then the user tries to add a comment after the fact.
     *
     * @param  {boolean} hasAnnotations Whether or not the dialog has comments
     * @return {void}
     */
    toggleHighlightCommentsReply(hasAnnotations) {
        const replyTextEl = this.commentsDialogEl.querySelector(constants.SECTION_CREATE);
        const commentTextEl = this.commentsDialogEl.querySelector(constants.SECTION_SHOW);

        // Ensures that "Add a comment here" text area is shown
        if (hasAnnotations) {
            util.hideElement(replyTextEl);
            util.showElement(commentTextEl);
            this.deactivateReply();
        } else {
            // Ensures that "Reply" text area is shown
            util.hideElement(commentTextEl);
            util.showElement(replyTextEl);
            this.activateReply();
        }

        // Reposition dialog
        if (!this.isMobile) {
            this.position();
        }
    }

    //--------------------------------------------------------------------------
    // Protected
    //--------------------------------------------------------------------------

    /**
     * Sets up the dialog element.
     *
     * @override
     * @param {Object} annotations Annotations to show in the dialog
     * @param {boolean} showComment Whether or not show comment highlight UI
     * @return {void}
     * @protected
     */
    setup(annotations, showComment) {
        // Only create an dialog element, if one doesn't already exist
        if (!this.element) {
            this.element = document.createElement('div');
        }

        // Determine if highlight buttons or comments dialog will display
        const firstAnnotation = util.getFirstAnnotation(annotations);
        if (firstAnnotation) {
            this.hasComments = firstAnnotation.text !== '' || Object.keys(annotations).length > 1;
        }

        // Generate HTML of highlight dialog
        const canDelete = firstAnnotation ? firstAnnotation.permissions.can_delete : this.canAnnotate;
        this.highlightDialogEl = this.generateHighlightDialogEl(canDelete, showComment);
        this.highlightDialogEl.classList.add(constants.CLASS_ANNOTATION_HIGHLIGHT_DIALOG);

        // Generate HTML of comments dialog
        this.commentsDialogEl = this.generateDialogEl(Object.keys(annotations).length);
        this.commentsDialogEl.classList.add(constants.CLASS_ANNOTATION_CONTAINER);

        this.dialogEl = document.createElement('div');
        this.dialogEl.appendChild(this.highlightDialogEl);
        this.dialogEl.appendChild(this.commentsDialogEl);
        if (this.hasComments) {
            this.highlightDialogEl.classList.add(constants.CLASS_HIDDEN);
        } else {
            this.commentsDialogEl.classList.add(constants.CLASS_HIDDEN);
        }

        if (!this.isMobile) {
            this.element.setAttribute('data-type', constants.DATA_TYPE_ANNOTATION_DIALOG);
            this.element.classList.add(constants.CLASS_ANNOTATION_DIALOG);
            this.element.classList.add(constants.CLASS_HIDDEN);
            this.element.innerHTML = `<div class="${constants.CLASS_ANNOTATION_CARET}"></div>`;
            this.element.appendChild(this.dialogEl);

            // Adding thread number to dialog
            if (firstAnnotation) {
                this.element.dataset.threadNumber = firstAnnotation.threadNumber;
            }
        }

        // Indicate that text is highlighted in the highlight buttons dialog
        if (firstAnnotation) {
            this.dialogEl.classList.add(CLASS_TEXT_HIGHLIGHTED);
        }

        // Checks if highlight is a plain highlight annotation and if
        // user name has been populated. If userID is 0, user name will
        // be 'Some User'
        if (util.isPlainHighlight(annotations) && firstAnnotation && firstAnnotation.user.id !== '0') {
            const highlightLabelEl = this.highlightDialogEl.querySelector(`.${CLASS_HIGHLIGHT_LABEL}`);
            highlightLabelEl.textContent = util.replacePlaceholders(this.localized.whoHighlighted, [
                firstAnnotation.user.name
            ]);
            util.showElement(highlightLabelEl);
        }

        // Add annotation elements
        this.addSortedAnnotations(annotations);

        if (!this.isMobile && this.canAnnotate) {
            this.bindDOMListeners();
        }
    }

    /**
     * Binds DOM event listeners.
     *
     * @override
     * @return {void}
     * @protected
     */
    bindDOMListeners() {
        this.element.addEventListener('mousedown', this.mousedownHandler);
        this.element.addEventListener('keydown', this.keydownHandler);
        this.element.addEventListener('mouseup', this.stopPropagation);
        this.element.addEventListener('wheel', this.stopPropagation);

        if (!this.isMobile) {
            this.element.addEventListener('mouseenter', this.mouseenterHandler);
            this.element.addEventListener('mouseleave', this.mouseleaveHandler);
        }
    }

    /**
     * Unbinds DOM event listeners.
     *
     * @override
     * @return {void}
     * @protected
     */
    unbindDOMListeners() {
        this.element.removeEventListener('mousedown', this.mousedownHandler);
        this.element.removeEventListener('keydown', this.keydownHandler);
        this.element.removeEventListener('mouseup', this.stopPropagation);
        this.element.removeEventListener('wheel', this.stopPropagation);

        if (!this.isMobile) {
            this.element.removeEventListener('mouseenter', this.mouseenterHandler);
            this.element.removeEventListener('mouseleave', this.mouseleaveHandler);
        }
    }

    /**
     * Toggles the highlight icon color to a darker yellow based on if the user
     * is hovering over the highlight to activate it
     *
     * @param {string} fillStyle RGBA fill style
     * @return {void}
     */
    toggleHighlightIcon(fillStyle) {
        const addHighlightBtn = this.dialogEl.querySelector(constants.SELECTOR_ADD_HIGHLIGHT_BTN);
        if (!addHighlightBtn) {
            return;
        }

        if (fillStyle === constants.HIGHLIGHT_FILL.active) {
            addHighlightBtn.classList.add(constants.CLASS_ACTIVE);
        } else {
            addHighlightBtn.classList.remove(constants.CLASS_ACTIVE);
        }
    }

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Keydown handler on dialog. Needed since we are binding to 'mousedown'
     * instead of 'click'.
     *
     * @override
     * @private
     * @return {void}
     */
    keydownHandler(event) {
        event.stopPropagation();
        if (util.decodeKeydown(event) === 'Enter') {
            this.mousedownHandler(event);
        }
        super.keydownHandler(event);
    }

    /**
     * Mousedown handler on dialog.
     *
     * @private
     * @param {Event} event DOM event
     * @return {void}
     */
    mousedownHandler(event) {
        event.stopPropagation();
        const dataType = util.findClosestDataType(event.target);

        switch (dataType) {
            // Clicking 'Highlight' button to create or remove a highlight
            case constants.DATA_TYPE_HIGHLIGHT:
                this.drawAnnotation();
                break;
            // Clicking 'Highlight' button to create a highlight
            case constants.DATA_TYPE_ADD_HIGHLIGHT_COMMENT:
                this.emit('annotationdraw');
                this.toggleHighlightCommentsReply(false);
                this.toggleHighlightDialogs();

                // Prevent mousedown from focusing on button clicked
                event.preventDefault();
                this.focusAnnotationsTextArea();
                break;

            default:
                super.clickHandler(event);
                break;
        }
    }

    /**
     * Saves or deletes the highlight annotation based on the current state of
     * the highlight
     *
     * @private
     * @return {void}
     */
    toggleHighlight() {
        const isTextHighlighted = this.dialogEl.classList.contains(CLASS_TEXT_HIGHLIGHTED);

        // Creates a blank highlight annotation
        if (!isTextHighlighted) {
            this.hasComments = false;
            this.dialogEl.classList.add(CLASS_TEXT_HIGHLIGHTED);
            this.emit('annotationcreate');

            // Deletes blank highlight annotation if user has permission
        } else {
            this.hasComments = true;
            this.emit('annotationdelete');
        }
    }

    /**
     * Focuses on "Add a comment" textarea in the annotations dialog
     *
     * @private
     * @return {void}
     */
    focusAnnotationsTextArea() {
        const textAreaEl = this.dialogEl.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
        if (util.isElementInViewport(textAreaEl)) {
            textAreaEl.focus();
        }
    }

    /**
     * Calculates the dialog width if the highlighter's name is to be displayed
     * in the annotations dialog
     *
     * @private
     * @return {number} Annotations dialog width
     */
    getDialogWidth() {
        // Ensure dialog will not be displayed off the page when
        // calculating the dialog width
        const prevDialogX = this.element.style.left;
        this.element.style.left = 0;

        // Switches to 'visibility: hidden' to ensure that dialog takes up
        // DOM space while still being invisible
        util.hideElementVisibility(this.element);
        util.showElement(this.element);

        this.highlightDialogWidth = this.element.getBoundingClientRect().width;

        // Switches back to 'display: none' to so that it no longer takes up place
        // in the DOM while remaining hidden
        util.hideElement(this.element);
        util.showInvisibleElement(this.element);

        // Reset dialog left positioning
        this.element.style.left = prevDialogX;

        return this.highlightDialogWidth;
    }

    /**
     * Get scaled coordinates for the lower center point of the highlight if the
     * highlight has comments or the lower right corner of the highlight for
     * plain highlights
     *
     * @private
     * @param  {DOMRect} pageDimensions Dimensions of the highlight annotations dialog element
     * @param  {number} pageHeight Document page height
     * @return {number[]} [x,y] coordinates in DOM space in CSS
     */
    getScaledPDFCoordinates(pageDimensions, pageHeight) {
        const zoomScale = util.getScale(this.annotatedElement);

        let [x, y] = docUtil.getLowerRightCornerOfLastQuadPoint(this.location.quadPoints);

        // If needed, scale coordinates comparing current dimensions with saved dimensions
        const dimensionScale = util.getDimensionScale(
            this.location.dimensions,
            pageDimensions,
            zoomScale,
            PAGE_PADDING_TOP + PAGE_PADDING_BOTTOM
        );
        if (dimensionScale) {
            x *= dimensionScale.x;
            y *= dimensionScale.y;
        }

        return docUtil.convertPDFSpaceToDOMSpace([x, y], pageHeight, zoomScale);
    }

    /**
     * Adds an annotation to the dialog.
     *
     * @override
     * @private
     * @param {Annotation} annotation Annotation to add
     * @return {void}
     */
    addAnnotationElement(annotation) {
        // If annotation text is blank, don't add to the comments dialog
        if (annotation.text === '') {
            this.highlightDialogEl.dataset.annotationId = annotation.annotationID;
        } else {
            super.addAnnotationElement(annotation);
        }
    }

    /**
     * Generates the highlight annotation dialog DOM element
     *
     * @private
     * @param {booelan} canDeleteAnnotation  Whether or not the user can delete the highlight annotation
     * @param {boolean} showComment Whether or not show comment highlight UI
     * @return {HTMLElement} Highlight annotation dialog DOM element
     */
    generateHighlightDialogEl(canDeleteAnnotation, showComment) {
        const highlightDialogEl = document.createElement('div');

        const highlightLabelEl = document.createElement('span');
        highlightLabelEl.classList.add(CLASS_HIGHLIGHT_LABEL);
        highlightLabelEl.classList.add(constants.CLASS_HIDDEN);
        highlightDialogEl.appendChild(highlightLabelEl);

        if (!this.canAnnotate) {
            return highlightDialogEl;
        }

        const highlightButtons = document.createElement('span');
        highlightButtons.classList.add(constants.CLASS_HIGHLIGHT_BTNS);
        highlightDialogEl.appendChild(highlightButtons);

        if (canDeleteAnnotation) {
            const addHighlightBtn = util.generateBtn(
                [constants.CLASS_BUTTON_PLAIN, constants.CLASS_ADD_HIGHLIGHT_BTN],
                this.localized.highlightToggle,
                ICON_HIGHLIGHT,
                constants.DATA_TYPE_HIGHLIGHT
            );
            highlightButtons.appendChild(addHighlightBtn);
        }

        if (showComment) {
            const addCommentBtn = util.generateBtn(
                [constants.CLASS_BUTTON_PLAIN, constants.CLASS_ADD_HIGHLIGHT_COMMENT_BTN],
                this.localized.highlightComment,
                ICON_HIGHLIGHT_COMMENT,
                constants.DATA_TYPE_ADD_HIGHLIGHT_COMMENT
            );
            highlightButtons.appendChild(addCommentBtn);
        }

        return highlightDialogEl;
    }
}

export default DocHighlightDialog;
