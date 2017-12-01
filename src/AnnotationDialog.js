import EventEmitter from 'events';
import * as util from './util';
import * as constants from './constants';
import { ICON_CLOSE, ICON_DELETE } from './icons/icons';

const POINT_ANNOTATION_ICON_HEIGHT = 31;
const POINT_ANNOTATION_ICON_DOT_HEIGHT = 8;
const CLASS_FLIPPED_DIALOG = 'bp-annotation-dialog-flipped';

const CLASS_CANCEL_DELETE = 'cancel-delete-btn';
const CLASS_COMMENT = 'annotation-comment';
const CLASS_COMMENTS_CONTAINER = 'annotation-comments';
const CLASS_REPLY_CONTAINER = 'reply-container';
const CLASS_REPLY_TEXTAREA = 'reply-textarea';
const CLASS_BUTTON_DELETE_COMMENT = 'delete-comment-btn';
const CLASS_DELETE_CONFIRMATION = 'delete-confirmation';
const CLASS_BUTTON_DELETE_CONFIRM = 'confirm-delete-btn';

class AnnotationDialog extends EventEmitter {
    //--------------------------------------------------------------------------
    // Typedef
    //--------------------------------------------------------------------------

    /**
     * The data object for constructing a dialog.
     *
     * @typedef {Object} AnnotationDialogData
     * @property {HTMLElement} annotatedElement HTML element being annotated on
     * @property {Object} annotations Annotations in dialog, can be an
     * empty array for a new thread
     * @property {Object} location Location object
     * @property {boolean} canAnnotate Whether or not user can annotate
     */

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * [constructor]
     *
     * @param {AnnotationDialogData} data - Data for constructing thread
     * @return {AnnotationDialog} Annotation dialog instance
     */
    constructor(data) {
        super();

        this.annotatedElement = data.annotatedElement;
        this.container = data.container;
        this.location = data.location;
        this.hasAnnotations = Object.keys(data.annotations).length > 0;
        this.canAnnotate = data.canAnnotate;
        this.locale = data.locale;
        this.isMobile = data.isMobile;

        // Explicitly bind listeners
        this.keydownHandler = this.keydownHandler.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        this.stopPropagation = this.stopPropagation.bind(this);
        this.validateTextArea = this.validateTextArea.bind(this);

        if (!this.isMobile) {
            this.mouseenterHandler = this.mouseenterHandler.bind(this);
            this.mouseleaveHandler = this.mouseleaveHandler.bind(this);
        }
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        if (this.element) {
            this.unbindDOMListeners();

            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }

            this.element = null;
        }
    }

    /**
     * Positions and shows the dialog.
     *
     * @return {void}
     */
    show() {
        // Populate mobile annotations dialog with annotations
        // information
        if (this.isMobile) {
            this.showMobileDialog();
        }

        const textAreaEl = this.hasAnnotations
            ? this.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`)
            : this.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);

        // Don't re-position if reply textarea is already active
        const textareaIsActive = textAreaEl.classList.contains(constants.CLASS_ACTIVE);
        if (textareaIsActive && this.element.parentNode) {
            return;
        }

        // Position and show - we need to reposition every time since
        // the DOM could have changed from zooming
        if (!this.isMobile) {
            this.position();
        }

        // Activate appropriate textarea
        if (this.hasAnnotations) {
            this.activateReply();
        } else {
            textAreaEl.classList.add(constants.CLASS_ACTIVE);
        }

        // Move cursor to end of text area
        if (textAreaEl.selectionStart) {
            textAreaEl.selectionEnd = textAreaEl.value.length;
            textAreaEl.selectionStart = textAreaEl.selectionEnd;
        }

        // Focus the textarea if visible
        if (util.isElementInViewport(textAreaEl)) {
            textAreaEl.focus();
        }

        this.scrollToLastComment();
    }

    /**
     * Auto scroll annotations dialog to bottom where new comment was added
     *
     * @return {void}
     */
    scrollToLastComment() {
        const annotationsEl = this.dialogEl.querySelector(constants.SELECTOR_ANNOTATION_CONTAINER);
        if (annotationsEl) {
            const isDialogFlipped = this.dialogEl.classList.contains(CLASS_FLIPPED_DIALOG);
            const clientHeight = isDialogFlipped ? 0 : annotationsEl.clientHeight;
            annotationsEl.scrollTop = annotationsEl.scrollHeight - clientHeight;
        }
    }

    /**
     * Shows the shared mobile dialog.
     *
     * @return {void}
     */
    showMobileDialog() {
        this.element = this.container.querySelector(`.${constants.CLASS_MOBILE_ANNOTATION_DIALOG}`);
        util.showElement(this.element);
        this.element.appendChild(this.dialogEl);

        const commentEls = this.element.querySelectorAll(`.${CLASS_COMMENT}`);
        if (this.highlightDialogEl && !commentEls.length) {
            this.element.classList.add(constants.CLASS_ANNOTATION_PLAIN_HIGHLIGHT);

            const headerEl = this.element.querySelector(constants.SELECTOR_MOBILE_DIALOG_HEADER);
            headerEl.classList.add(constants.CLASS_HIDDEN);
        }

        const dialogCloseButtonEl = this.element.querySelector(constants.SELECTOR_DIALOG_CLOSE);

        this.hideMobileDialog = this.hideMobileDialog.bind(this);
        dialogCloseButtonEl.addEventListener('click', this.hideMobileDialog);

        this.element.classList.add(constants.CLASS_ANIMATE_DIALOG);

        this.bindDOMListeners();
    }

    /**
     * Hides and resets the shared mobile dialog.
     *
     * @return {void}
     */
    hideMobileDialog() {
        if (!this.element) {
            return;
        }

        if (this.dialogEl && this.dialogEl.parentNode) {
            this.dialogEl.parentNode.removeChild(this.dialogEl);
        }

        this.element.classList.remove(constants.CLASS_ANIMATE_DIALOG);

        // Clear annotations from dialog
        this.element.innerHTML = `
            <div class="${constants.CLASS_MOBILE_DIALOG_HEADER}">
                <button class="${constants.CLASS_DIALOG_CLOSE}">${ICON_CLOSE}</button>
            </div>`.trim();
        this.element.classList.remove(constants.CLASS_ANNOTATION_PLAIN_HIGHLIGHT);

        const dialogCloseButtonEl = this.element.querySelector(constants.SELECTOR_DIALOG_CLOSE);
        dialogCloseButtonEl.removeEventListener('click', this.hideMobileDialog);

        util.hideElement(this.element);
        this.unbindDOMListeners();

        // Cancel any unsaved annotations
        this.cancelAnnotation();
    }

    /**
     * Hides the dialog.
     *
     * @return {void}
     */
    hide() {
        if (this.element && this.element.classList.contains(constants.CLASS_HIDDEN)) {
            return;
        }

        if (this.isMobile) {
            this.hideMobileDialog();
        }

        util.hideElement(this.element);
        this.deactivateReply();

        // Make sure entire thread icon displays for flipped dialogs
        this.toggleFlippedThreadEl();
    }

    /**
     * Adds an annotation to the dialog.
     *
     * @param {Annotation} annotation - Annotation to add
     * @return {void}
     */
    addAnnotation(annotation) {
        // Show new section if needed
        if (!this.hasAnnotations) {
            const createSectionEl = this.element.querySelector(constants.SECTION_CREATE);
            const showSectionEl = this.element.querySelector(constants.SECTION_SHOW);
            util.hideElement(createSectionEl);
            util.showElement(showSectionEl);
            this.hasAnnotations = true;
        }

        this.addAnnotationElement(annotation);
    }

    /**
     * Removes an annotation from the dialog.
     *
     * @param {string} annotationID - ID of annotation to remove
     * @return {void}
     */
    removeAnnotation(annotationID) {
        const annotationEl = this.element.querySelector(`[data-annotation-id="${annotationID}"]`);
        if (annotationEl) {
            annotationEl.parentNode.removeChild(annotationEl);
        }

        const replyTextEl = this.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
        if (replyTextEl) {
            replyTextEl.focus();
        }
    }

    /**
     * Posts an annotation in the dialog.
     *
     * @param {string} [textInput] - Annotation text to post
     * @return {void}
     */
    postAnnotation(textInput) {
        const annotationTextEl = this.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
        const text = textInput || annotationTextEl.value;
        if (text.trim() === '') {
            annotationTextEl.classList.add(constants.CLASS_INVALID_INPUT);
            return;
        }

        this.emit('annotationcreate', { text });
        annotationTextEl.value = '';
        annotationTextEl.focus();
    }

    //--------------------------------------------------------------------------
    // Abstract
    //--------------------------------------------------------------------------

    /**
     * Must be implemented to position the dialog on the preview.
     *
     * @return {void}
     */
    position() {}

    //--------------------------------------------------------------------------
    // Protected
    //--------------------------------------------------------------------------

    /**
     * Sets up the dialog element.
     *
     * @param {Object} annotations - Annotations to show in the dialog
     * @param {HTMLElement} threadEl - Annotation icon element
     * @return {void}
     * @protected
     */
    setup(annotations, threadEl) {
        this.threadEl = threadEl;

        // Generate HTML of dialog
        this.dialogEl = this.generateDialogEl(Object.keys(annotations).length);
        this.dialogEl.classList.add(constants.CLASS_ANNOTATION_CONTAINER);

        // Setup shared mobile annotations dialog
        if (!this.isMobile) {
            this.element = document.createElement('div');
            this.element.setAttribute('data-type', constants.DATA_TYPE_ANNOTATION_DIALOG);
            this.element.classList.add(constants.CLASS_ANNOTATION_DIALOG);
            this.element.innerHTML = `<div class="${constants.CLASS_ANNOTATION_CARET}"></div>`;
            this.element.appendChild(this.dialogEl);

            // Adding thread number to dialog
            const firstAnnotation = util.getFirstAnnotation(annotations);
            if (firstAnnotation) {
                this.element.dataset.threadNumber = firstAnnotation.threadNumber;
            }

            this.bindDOMListeners();
        }

        // Add annotation elements
        this.addSortedAnnotations(annotations);
    }

    /**
     * Sorts and adds annotations to the dialog
     *
     * @param {Object} annotations - Annotations to show in the dialog
     * @return {void}
     * @protected
     */
    addSortedAnnotations(annotations) {
        // Sort annotations by date created
        const sorted = Object.keys(annotations).map((key) => annotations[key]);
        sorted.sort((a, b) => {
            return new Date(a.created) - new Date(b.created);
        });

        // Add sorted annotations to dialog
        sorted.forEach((annotation) => {
            this.addAnnotationElement(annotation);
        });
    }

    /**
     * Binds DOM event listeners.
     *
     * @protected
     * @return {void}
     */
    bindDOMListeners() {
        this.element.addEventListener('keydown', this.keydownHandler);
        this.element.addEventListener('click', this.clickHandler);
        this.element.addEventListener('mouseup', this.stopPropagation);
        this.element.addEventListener('wheel', this.stopPropagation);

        const replyTextEl = this.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
        if (replyTextEl) {
            replyTextEl.addEventListener('focus', this.validateTextArea);
        }

        const annotationTextEl = this.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
        if (annotationTextEl) {
            annotationTextEl.addEventListener('focus', this.validateTextArea);
        }

        if (!this.isMobile) {
            this.element.addEventListener('mouseenter', this.mouseenterHandler);
            this.element.addEventListener('mouseleave', this.mouseleaveHandler);
        }
    }

    /**
     * Removes red border around textarea on focus
     *
     * @protected
     * @param {Event} event Keyboard event
     * @return {void}
     */
    validateTextArea(event) {
        const textEl = event.target;
        if (textEl.type !== 'textarea' || textEl.value.trim() === '') {
            return;
        }

        textEl.classList.remove(constants.CLASS_INVALID_INPUT);
    }

    /**
     * Unbinds DOM event listeners.
     *
     * @protected
     * @return {void}
     */
    unbindDOMListeners() {
        this.element.removeEventListener('keydown', this.keydownHandler);
        this.element.removeEventListener('click', this.clickHandler);
        this.element.removeEventListener('mouseup', this.stopPropagation);
        this.element.removeEventListener('wheel', this.stopPropagation);

        const replyTextEl = this.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
        if (replyTextEl) {
            replyTextEl.removeEventListener('focus', this.validateTextArea);
        }

        const annotationTextEl = this.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
        if (annotationTextEl) {
            annotationTextEl.removeEventListener('focus', this.validateTextArea);
        }

        if (!this.isMobile) {
            this.element.removeEventListener('mouseenter', this.mouseenterHandler);
            this.element.removeEventListener('mouseleave', this.mouseleaveHandler);
        }
    }

    /**
     * Mouseenter handler. Clears hide timeout.
     *
     * @protected
     * @return {void}
     */
    mouseenterHandler() {
        if (this.element.classList.contains(constants.CLASS_HIDDEN)) {
            util.showElement(this.element);

            const replyTextArea = this.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
            const commentsTextArea = this.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
            if (replyTextArea.textContent !== '' || commentsTextArea.textContent !== '') {
                this.emit('annotationcommentpending');
            }
        }

        // Ensure textarea stays open
        this.activateReply();
    }

    /**
     * Mouseleave handler. Hides dialog if we aren't creating the first one.
     *
     * @protected
     * @return {void}
     */
    mouseleaveHandler() {
        if (this.hasAnnotations) {
            this.hide();
        }
    }

    /**
     * Enable all buttons for the temporary annotation element
     *
     * @protected
     * @param {string} annotationID Annotation of saved annotation element
     * @return {void}
     */
    enable(annotationID) {
        const annotationEl = this.element.querySelector(`[data-annotation-id="${annotationID}"]`);
        if (!annotationEl) {
            return;
        }

        const btns = annotationEl.querySelectorAll('button');
        Array.prototype.forEach.call(btns, (btn) => {
            btn.classList.remove(constants.CLASS_DISABLED);
        });
    }

    /**
     * Disable all buttons for the temporary annotation element
     *
     * @protected
     * @param {string} tempAnnotationID Annotation of temporary annotation element
     * @return {void}
     */
    disable(tempAnnotationID) {
        const annotationEl = this.element.querySelector(`[data-annotation-id="${tempAnnotationID}"]`);
        if (!annotationEl) {
            return;
        }

        const btns = annotationEl.querySelectorAll('button');
        Array.prototype.forEach.call(btns, (btn) => {
            btn.classList.add(constants.CLASS_DISABLED);
        });
    }

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Keydown handler for dialog.
     *
     * @private
     * @param {Event} event - DOM event
     * @return {void}
     */
    keydownHandler(event) {
        event.stopPropagation();

        const key = util.decodeKeydown(event);
        if (key === 'Escape') {
            this.hide();
        } else {
            const dataType = util.findClosestDataType(event.target);
            if (dataType === CLASS_REPLY_TEXTAREA) {
                this.activateReply();
            }
        }
    }

    /**
     * Stops propagation of DOM event.
     *
     * @private
     * @param {Event} event - DOM event
     * @return {void}
     */
    stopPropagation(event) {
        event.stopPropagation();
    }

    /**
     * Click handler on dialog.
     *
     * @private
     * @param {Event} event - DOM event
     * @return {void}
     */
    clickHandler(event) {
        event.stopPropagation();

        const eventTarget = event.target;
        const dataType = util.findClosestDataType(eventTarget);
        const annotationID = util.findClosestDataType(eventTarget, 'data-annotation-id');

        switch (dataType) {
            // Clicking 'Post' button to create an annotation
            case constants.DATA_TYPE_POST:
                this.postAnnotation();
                break;
            // Clicking 'Cancel' button to cancel the annotation
            case constants.DATA_TYPE_CANCEL:
                if (this.isMobile) {
                    this.hide();
                } else {
                    // Cancels + destroys the annotation thread
                    this.cancelAnnotation();
                }

                this.deactivateReply(true);
                break;
            // Clicking inside reply text area
            case constants.DATA_TYPE_REPLY_TEXTAREA:
                this.activateReply();
                break;
            // Canceling a reply
            case constants.DATA_TYPE_CANCEL_REPLY:
                this.deactivateReply(true);
                break;
            // Clicking 'Post' button to create a reply annotation
            case constants.DATA_TYPE_POST_REPLY:
                this.postReply();
                break;
            // Clicking trash icon to initiate deletion
            case constants.DATA_TYPE_DELETE:
                this.showDeleteConfirmation(annotationID);
                break;
            // Clicking 'Cancel' button to cancel deletion
            case constants.DATA_TYPE_CANCEL_DELETE:
                this.hideDeleteConfirmation(annotationID);
                break;
            // Clicking 'Delete' button to confirm deletion
            case constants.DATA_TYPE_CONFIRM_DELETE: {
                this.deleteAnnotation(annotationID);
                break;
            }

            default:
                break;
        }
    }

    /**
     * Adds an annotation to the dialog.
     *
     * @private
     * @param {Annotation} annotation - Annotation to add
     * @return {void}
     */
    addAnnotationElement(annotation) {
        const userId = util.htmlEscape(annotation.user.id || '0');

        // Temporary until annotation user API is available
        let userName;
        if (userId === '0') {
            userName = this.localized.posting;
        } else {
            userName = util.htmlEscape(annotation.user.name) || this.localized.anonymousUserName;
        }

        const avatarUrl = util.htmlEscape(annotation.user.avatarUrl || '');
        const avatarHtml = util.getAvatarHtml(avatarUrl, userId, userName, this.localized.profileAlt);
        const created = new Date(annotation.created).toLocaleString(this.locale, {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const text = util.htmlEscape(annotation.text);

        const annotationEl = document.createElement('div');
        annotationEl.classList.add(CLASS_COMMENT);
        annotationEl.setAttribute('data-annotation-id', annotation.annotationID);

        const annotationContainerEl = this.dialogEl.querySelector(`.${CLASS_COMMENTS_CONTAINER}`);
        annotationContainerEl.appendChild(annotationEl);

        // Avatar
        const avatarEl = document.createElement('div');
        avatarEl.classList.add('profile-image-container');
        avatarEl.innerHTML = avatarHtml;
        annotationEl.appendChild(avatarEl);

        // Creator namate & date
        const profileContainerEl = document.createElement('div');
        profileContainerEl.classList.add('profile-container');
        annotationEl.appendChild(profileContainerEl);

        const userNameEl = document.createElement('div');
        userNameEl.classList.add('user-name');
        userNameEl.textContent = userName;
        profileContainerEl.appendChild(userNameEl);

        const createdEl = document.createElement('div');
        createdEl.classList.add('comment-date');
        createdEl.textContent = created;
        profileContainerEl.appendChild(createdEl);

        // Comment
        const commentTextEl = document.createElement('div');
        commentTextEl.classList.add('comment-text');
        commentTextEl.textContent = text;
        annotationEl.appendChild(commentTextEl);

        // Delete button
        if (!annotation.permissions.can_delete) {
            return;
        }

        const deleteBtn = util.generateBtn(
            [constants.CLASS_BUTTON_PLAIN, CLASS_BUTTON_DELETE_COMMENT],
            this.localized.deleteButton,
            ICON_DELETE,
            constants.DATA_TYPE_DELETE
        );
        annotationEl.appendChild(deleteBtn);

        const deleteConfirmEl = document.createElement('div');
        deleteConfirmEl.classList.add(CLASS_DELETE_CONFIRMATION);
        deleteConfirmEl.classList.add(constants.CLASS_HIDDEN);
        annotationEl.appendChild(deleteConfirmEl);

        const confirmMsgEl = document.createElement('div');
        confirmMsgEl.classList.add('delete-confirmation-message');
        confirmMsgEl.textContent = this.localized.deleteConfirmation;
        deleteConfirmEl.appendChild(confirmMsgEl);

        const deleteBtnsEl = document.createElement('div');
        deleteBtnsEl.classList.add(constants.CLASS_BUTTON_CONTAINER);
        deleteConfirmEl.appendChild(deleteBtnsEl);

        const cancelDeleteBtn = util.generateBtn(
            [constants.CLASS_BUTTON, CLASS_CANCEL_DELETE],
            this.localized.cancelButton,
            this.localized.cancelButton,
            constants.DATA_TYPE_CANCEL_DELETE
        );
        deleteBtnsEl.appendChild(cancelDeleteBtn);

        const confirmDeleteBtn = util.generateBtn(
            [constants.CLASS_BUTTON, CLASS_BUTTON_DELETE_CONFIRM, constants.CLASS_BUTTON_PRIMARY],
            this.localized.deleteButton,
            this.localized.deleteButton,
            constants.DATA_TYPE_CONFIRM_DELETE
        );
        deleteBtnsEl.appendChild(confirmDeleteBtn);
    }

    /**
     * Cancels posting an annotation.
     *
     * @private
     * @return {void}
     */
    cancelAnnotation() {
        this.emit('annotationcancel');
    }

    /**
     * Activates reply textarea.
     *
     * @private
     * @return {void}
     */
    activateReply() {
        if (!this.dialogEl) {
            return;
        }

        const replyTextEl = this.dialogEl.querySelector(`.${CLASS_REPLY_TEXTAREA}`);

        // Don't activate if reply textarea is already active
        const isActive = replyTextEl.classList.contains(constants.CLASS_ACTIVE);
        if (isActive) {
            return;
        }

        const replyButtonEls = replyTextEl.parentNode.querySelector(constants.SELECTOR_BUTTON_CONTAINER);
        replyTextEl.classList.add(constants.CLASS_ACTIVE);
        util.showElement(replyButtonEls);

        this.scrollToLastComment();
    }

    /**
     * Deactivate reply textarea.
     *
     * @private
     * @param {boolean} clearText - Whether or not text in text area should be cleared
     * @return {void}
     */
    deactivateReply(clearText) {
        if (!this.dialogEl) {
            return;
        }

        const replyContainerEl = this.dialogEl.querySelector(`.${CLASS_REPLY_CONTAINER}`);
        const replyTextEl = replyContainerEl.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
        const replyButtonEls = replyContainerEl.querySelector(constants.SELECTOR_BUTTON_CONTAINER);
        util.resetTextarea(replyTextEl, clearText);
        util.hideElement(replyButtonEls);

        // Only focus on textarea if dialog is visible
        if (util.isElementInViewport(replyTextEl)) {
            replyTextEl.focus();
        }

        this.scrollToLastComment();
    }

    /**
     * Posts a reply in the dialog.
     *
     * @private
     * @return {void}
     */
    postReply() {
        const replyTextEl = this.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
        const text = replyTextEl.value;
        if (text.trim() === '') {
            replyTextEl.classList.add(constants.CLASS_INVALID_INPUT);
            return;
        }

        this.emit('annotationcreate', { text });
        replyTextEl.value = '';
        replyTextEl.focus();
    }

    /**
     * Shows delete confirmation.
     *
     * @private
     * @param {string} annotationID - ID of annotation to delete
     * @return {void}
     */
    showDeleteConfirmation(annotationID) {
        const annotationEl = this.element.querySelector(`[data-annotation-id="${annotationID}"]`);
        const deleteConfirmationEl = annotationEl.querySelector(`.${CLASS_DELETE_CONFIRMATION}`);
        const cancelDeleteButtonEl = annotationEl.querySelector(`.${CLASS_CANCEL_DELETE}`);
        const deleteButtonEl = annotationEl.querySelector(constants.SELECTOR_DELETE_COMMENT_BTN);
        util.hideElement(deleteButtonEl);
        util.showElement(deleteConfirmationEl);
        cancelDeleteButtonEl.focus();
    }

    /**
     * Hides delete confirmation.
     *
     * @private
     * @param {string} annotationID - ID of annotation to delete
     * @return {void}
     */
    hideDeleteConfirmation(annotationID) {
        const annotationEl = this.element.querySelector(`[data-annotation-id="${annotationID}"]`);
        const deleteConfirmationEl = annotationEl.querySelector(`.${CLASS_DELETE_CONFIRMATION}`);
        const deleteButtonEl = annotationEl.querySelector(constants.SELECTOR_DELETE_COMMENT_BTN);
        util.showElement(deleteButtonEl);
        util.hideElement(deleteConfirmationEl);
        deleteButtonEl.focus();
    }

    /**
     * Broadcasts message to delete an annotation.
     *
     * @private
     * @param {string} annotationID - ID of annotation to delete
     * @return {void}
     */
    deleteAnnotation(annotationID) {
        this.emit('annotationdelete', { annotationID });
    }

    /**
     * Generates the annotation dialog DOM element
     *
     * @private
     * @param {number} numAnnotations - length of annotations array
     * @return {HTMLElement} Annotation dialog DOM element
     */
    generateDialogEl(numAnnotations) {
        const dialogEl = document.createElement('div');
        dialogEl.innerHTML = `
            <section class="${numAnnotations ? constants.CLASS_HIDDEN : ''}" data-section="create">
                <textarea class="${constants.CLASS_TEXTAREA} ${constants.CLASS_ANNOTATION_TEXTAREA}"
                    placeholder="${this.localized.addCommentPlaceholder}"></textarea>
                <div class="${constants.CLASS_BUTTON_CONTAINER}">
                    <button class="${constants.CLASS_BUTTON} ${constants.CLASS_ANNOTATION_BUTTON_CANCEL}" data-type="${
    constants.DATA_TYPE_CANCEL
}">
                        ${this.localized.cancelButton}
                    </button>
                    <button class="${constants.CLASS_BUTTON} ${constants.CLASS_BUTTON_PRIMARY} ${
    constants.CLASS_ANNOTATION_BUTTON_POST
}" data-type="${constants.DATA_TYPE_POST}">
                        ${this.localized.postButton}
                    </button>
                </div>
            </section>
            <section class="${numAnnotations ? '' : constants.CLASS_HIDDEN}" data-section="show">
                <div class="${CLASS_COMMENTS_CONTAINER}"></div>
                <div class="${CLASS_REPLY_CONTAINER}">
                    <textarea class="${constants.CLASS_TEXTAREA} ${CLASS_REPLY_TEXTAREA}"
                        placeholder="${this.localized.replyPlaceholder}" data-type="${
    constants.DATA_TYPE_REPLY_TEXTAREA
}"></textarea>
                    <div class="${constants.CLASS_BUTTON_CONTAINER} ${constants.CLASS_HIDDEN}">
                        <button class="${constants.CLASS_BUTTON} ${
    constants.CLASS_ANNOTATION_BUTTON_CANCEL
}" data-type="${constants.DATA_TYPE_CANCEL_REPLY}">
                            ${this.localized.cancelButton}
                        </button>
                        <button class="${constants.CLASS_BUTTON} ${constants.CLASS_BUTTON_PRIMARY} ${
    constants.CLASS_ANNOTATION_BUTTON_POST
}" data-type="${constants.DATA_TYPE_POST_REPLY}">
                            ${this.localized.postButton}
                        </button>
                    </div>
                </div>
            </section>`.trim();
        return dialogEl;
    }

    /**
     * Flip the annotations dialog if the dialog would appear in the lower
     * half of the viewer
     *
     * @private
     * @param {number} yPos - y coordinate for the top of the dialog
     * @param {number} containerHeight - height of the current annotation
     * container/page
     * @return {void}
     */
    flipDialog(yPos, containerHeight) {
        let top = '';
        let bottom = '';
        const iconPadding = POINT_ANNOTATION_ICON_HEIGHT - POINT_ANNOTATION_ICON_DOT_HEIGHT / 2;
        const annotationCaretEl = this.element.querySelector(constants.SELECTOR_ANNOTATION_CARET);

        if (yPos <= containerHeight / 2) {
            // Keep dialog below the icon if in the top half of the viewport
            top = `${yPos - POINT_ANNOTATION_ICON_DOT_HEIGHT}px`;
            bottom = '';

            this.element.classList.remove(CLASS_FLIPPED_DIALOG);

            annotationCaretEl.style.bottom = '';
        } else {
            // Flip dialog to above the icon if in the lower half of the viewport
            const flippedY = containerHeight - yPos - iconPadding;
            top = '';
            bottom = `${flippedY}px`;

            this.element.classList.add(CLASS_FLIPPED_DIALOG);

            // Adjust dialog caret
            annotationCaretEl.style.top = '';
            annotationCaretEl.style.bottom = '0px';
        }

        this.fitDialogHeightInPage();
        this.toggleFlippedThreadEl();
        return { top, bottom };
    }

    /**
     * Show/hide the top portion of the annotations icon based on if the
     * entire dialog is flipped
     *
     * @private
     * @return {void}
     */
    toggleFlippedThreadEl() {
        if (!this.element || !this.threadEl) {
            return;
        }

        const isDialogFlipped = this.element.classList.contains(CLASS_FLIPPED_DIALOG);
        if (!isDialogFlipped) {
            return;
        }

        if (this.element.classList.contains(constants.CLASS_HIDDEN)) {
            this.threadEl.classList.remove(CLASS_FLIPPED_DIALOG);
        } else {
            this.threadEl.classList.add(CLASS_FLIPPED_DIALOG);
        }
    }

    /**
     * Set max height for dialog to prevent the dialog from being cut off
     *
     * @private
     * @return {void}
     */
    fitDialogHeightInPage() {
        const maxHeight = this.container.clientHeight / 2 - constants.PAGE_PADDING_TOP - constants.PAGE_PADDING_BOTTOM;
        this.dialogEl.style.maxHeight = `${maxHeight}px`;

        const commentsEl = this.dialogEl.querySelector(`.${constants.CLASS_ANNOTATION_CONTAINER}`);
        if (commentsEl) {
            commentsEl.style.maxHeight = `${maxHeight}px`;
        }
    }
}

export default AnnotationDialog;
