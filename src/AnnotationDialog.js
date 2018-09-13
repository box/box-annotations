import EventEmitter from 'events';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import * as util from './util';
import * as constants from './constants';

import Annotation from './components/Annotation';

const POINT_ANNOTATION_ICON_HEIGHT = 31;
const POINT_ANNOTATION_ICON_DOT_HEIGHT = 8;
const CLASS_FLIPPED_DIALOG = 'ba-annotation-dialog-flipped';

const CLASS_COMMENT = 'annotation-comment';
const CLASS_COMMENTS_CONTAINER = 'annotation-comments';
const CLASS_REPLY_CONTAINER = 'reply-container';
const CLASS_REPLY_TEXTAREA = 'reply-textarea';

class AnnotationDialog extends EventEmitter {
    //--------------------------------------------------------------------------
    // Typedef
    //--------------------------------------------------------------------------

    /**
     * The data object for constructing a dialog.
     *
     * @typedef {Object} AnnotationDialogData
     * @property {HTMLElement} annotatedElement HTML element being annotated on
     * @property {Annotation[]} annotations Annotations in dialog, can be an
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
     * @param {AnnotationDialogData} data Data for constructing thread
     * @return {AnnotationDialog} Annotation dialog instance
     */
    constructor(data) {
        super();

        this.annotatedElement = data.annotatedElement;
        this.container = data.container;
        this.location = data.location;
        this.canAnnotate = data.canAnnotate;
        this.locale = data.locale;
        this.isMobile = data.isMobile || false;
        this.hasTouch = data.hasTouch || false;

        // Explicitly bind listeners
        this.keydownHandler = this.keydownHandler.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        this.stopPropagation = this.stopPropagation.bind(this);
        this.validateTextArea = this.validateTextArea.bind(this);
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        if (this.element) {
            this.unbindDOMListeners();

            const annotationContainerEl = this.dialogEl.querySelector(`.${CLASS_COMMENTS_CONTAINER}`);
            if (this.annotationListComponent && annotationContainerEl) {
                unmountComponentAtNode(annotationContainerEl);
                this.annotationListComponent = null;
            }

            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }

            this.element = null;
        }
    }

    /**
     * Positions and shows the dialog.
     *
     * @param {Annotations[]} annotations List of annotations
     * @return {void}
     */
    show(annotations) {
        this.emit('annotationshow');

        // Populate mobile annotations dialog with annotations information
        if (this.isMobile) {
            this.showMobileDialog();
        }

        // Show the appropriate section
        const createSectionEl = this.element.querySelector(constants.SECTION_CREATE);
        const showSectionEl = this.element.querySelector(constants.SECTION_SHOW);
        if (!this.hasAnnotations(annotations)) {
            util.showElement(createSectionEl);
            util.hideElement(showSectionEl);
        } else {
            util.hideElement(createSectionEl);
            util.showElement(showSectionEl);
        }

        // Position and show - we need to reposition every time since
        // the DOM could have changed from zooming
        if (!this.isMobile) {
            this.position();
        }

        if (!this.hasAnnotations(annotations)) {
            return;
        }
        const annotationContainerEl = this.dialogEl.querySelector(`.${CLASS_COMMENTS_CONTAINER}`);
        const language = this.locale.substr(0, this.locale.indexOf('-'));

        this.annotationListComponent = render(
            <ul className='ba-annotation-list'>
                {annotations.map((annotation) => {
                    const { id, type } = annotation;
                    if (type === constants.TYPES.highlight) {
                        return null;
                    }

                    return (
                        <li className='ba-annotation-list-item' key={`annotation_${id}`}>
                            <Annotation
                                {...annotation}
                                language={language}
                                onDelete={() => this.emitAnnotationDelete(annotation)}
                            />
                        </li>
                    );
                })}
            </ul>,
            annotationContainerEl
        );

        this.scrollToLastComment(annotations);
    }

    /**
     * Auto scroll annotations dialog to bottom where new comment was added
     *
     * @param {Annotations[]} annotations List of annotations
     * @return {void}
     */
    scrollToLastComment(annotations) {
        if (!this.element) {
            return;
        }

        // Activate and move cursor in the appropriate text area if not in read-only mode
        if (this.hasAnnotations(annotations)) {
            this.activateReply();
        }

        const textAreaEl = this.hasAnnotations(annotations)
            ? this.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`)
            : this.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
        util.focusTextArea(textAreaEl);

        const annotationsEl = this.element.querySelector(constants.SELECTOR_ANNOTATION_CONTAINER);
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

        // Do not re-show dialog if it is already visible
        if (!this.element.classList.contains(constants.CLASS_HIDDEN)) {
            return;
        }

        util.showElement(this.element);
        this.element.appendChild(this.dialogEl);

        const commentEls = this.element.querySelectorAll(`.${CLASS_COMMENT}`);
        if (this.highlightDialogEl && !commentEls.length) {
            this.element.classList.add(constants.CLASS_ANNOTATION_PLAIN_HIGHLIGHT);

            const headerEl = this.element.querySelector(constants.SELECTOR_MOBILE_DIALOG_HEADER);
            headerEl.classList.add(constants.CLASS_HIDDEN);
        }

        this.element.classList.add(constants.CLASS_ANIMATE_DIALOG);

        this.bindDOMListeners();
    }

    /**
     * Hides the shared mobile dialog.
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

        // Clear annotations from dialog
        util.hideElement(this.element);
        this.unbindDOMListeners();
        this.element = util.generateMobileDialogEl();
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
        this.emit('annotationhide');

        // Make sure entire thread icon displays for flipped dialogs
        this.toggleFlippedThreadEl();
    }

    /**
     * Posts an annotation in the dialog.
     *
     * @param {string} [textInput] Annotation text to post
     * @return {void}
     */
    postAnnotation(textInput) {
        const annotationTextEl = this.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
        const message = textInput || annotationTextEl.value;
        if (message.trim() === '') {
            annotationTextEl.classList.add(constants.CLASS_INVALID_INPUT);
            return;
        }

        this.emit('annotationcreate', message);
        annotationTextEl.value = '';
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
     * @param {Object} [annotations] Annotations to show in the dialog
     * @param {HTMLElement} [threadEl] Annotation icon element
     * @return {void}
     * @protected
     */
    setup(annotations = [], threadEl = undefined) {
        this.threadEl = threadEl;

        // Generate HTML of dialog
        this.dialogEl = this.generateDialogEl(annotations.length);
        this.dialogEl.classList.add(constants.CLASS_ANNOTATION_CONTAINER);

        // Setup annotations dialog if not on a mobile device
        if (!this.isMobile) {
            this.element = document.createElement('div');
            this.element.setAttribute('data-type', constants.DATA_TYPE_ANNOTATION_DIALOG);
            this.element.classList.add(constants.CLASS_ANNOTATION_DIALOG);
            this.element.classList.add(constants.CLASS_HIDDEN);
            this.element.innerHTML = `<div class="${constants.CLASS_ANNOTATION_CARET}"></div>`;
            this.element.appendChild(this.dialogEl);

            // Adding thread number to dialog
            const firstAnnotation = annotations[0];
            if (firstAnnotation) {
                this.element.dataset.threadNumber = firstAnnotation.threadNumber;
            }

            this.bindDOMListeners();
        }

        this.show(annotations);
    }

    /**
     * Binds DOM event listeners.
     *
     * @protected
     * @return {void}
     */
    bindDOMListeners() {
        this.element.addEventListener('keydown', this.keydownHandler);
        this.element.addEventListener('wheel', this.stopPropagation);
        this.element.addEventListener('mouseup', this.stopPropagation);

        if (this.hasTouch) {
            this.element.addEventListener('touchstart', this.clickHandler);
            this.element.addEventListener('touchstart', this.stopPropagation);
        }

        const replyTextEl = this.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
        if (replyTextEl) {
            replyTextEl.addEventListener('focus', this.validateTextArea);
        }

        const annotationTextEl = this.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
        if (annotationTextEl) {
            annotationTextEl.addEventListener('focus', this.validateTextArea);
        }

        if (!this.isMobile) {
            this.element.addEventListener('click', this.clickHandler);
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
        this.element.removeEventListener('mouseup', this.stopPropagation);
        this.element.removeEventListener('wheel', this.stopPropagation);

        if (this.hasTouch) {
            this.element.removeEventListener('touchstart', this.clickHandler);
            this.element.removeEventListener('touchstart', this.stopPropagation);
        }

        const replyTextEl = this.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
        if (replyTextEl) {
            replyTextEl.removeEventListener('focus', this.validateTextArea);
        }

        const annotationTextEl = this.element.querySelector(constants.SELECTOR_ANNOTATION_TEXTAREA);
        if (annotationTextEl) {
            annotationTextEl.removeEventListener('focus', this.validateTextArea);
        }

        if (!this.isMobile) {
            this.element.removeEventListener('click', this.clickHandler);
            this.element.removeEventListener('click', this.stopPropagation);
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
     * @param {Event} event DOM event
     * @return {void}
     */
    keydownHandler(event) {
        event.stopPropagation();

        const key = util.decodeKeydown(event);
        if (key === 'Escape') {
            if (this.hasAnnotations()) {
                this.hide();
            } else {
                this.cancelAnnotation();
            }
        } else {
            const dataType = util.findClosestDataType(event.target);
            if (dataType === CLASS_REPLY_TEXTAREA) {
                this.scrollToLastComment();
            }
        }
    }

    /**
     * Stops propagation of DOM event.
     *
     * @private
     * @param {Event} event DOM event
     * @return {void}
     */
    stopPropagation(event) {
        event.stopPropagation();
    }

    /**
     * Click handler on dialog.
     *
     * @private
     * @param {Event} event DOM event
     * @return {void}
     */
    clickHandler(event) {
        const eventTarget = event.target;
        const dataType = util.findClosestDataType(eventTarget);

        switch (dataType) {
            // Clicking 'Post' button to create an annotation
            case constants.DATA_TYPE_POST:
                this.postAnnotation();
                break;
            // Clicking 'Cancel' button to cancel the annotation OR
            // Clicking 'X' button on mobile dialog to close
            case constants.DATA_TYPE_CANCEL:
            case constants.DATA_TYPE_MOBILE_CLOSE:
                // @spramod: is the mobile close button still needed?
                this.hide();

                if (!this.isMobile) {
                    // Cancels + destroys the annotation thread
                    this.cancelAnnotation();
                }
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

            default:
                break;
        }
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
        if (!replyTextEl) {
            return;
        }

        // Don't activate if reply textarea is already active
        const isActive = replyTextEl.classList.contains(constants.CLASS_ACTIVE);
        replyTextEl.classList.remove(constants.CLASS_INVALID_INPUT);
        if (isActive) {
            return;
        }

        const replyButtonEls = replyTextEl.parentNode.querySelector(constants.SELECTOR_BUTTON_CONTAINER);
        replyTextEl.classList.add(constants.CLASS_ACTIVE);
        util.showElement(replyButtonEls);
    }

    /**
     * Deactivate reply textarea.
     *
     * @private
     * @param {boolean} clearText Whether or not text in text area should be cleared
     * @return {void}
     */
    deactivateReply(clearText) {
        if (!this.dialogEl) {
            return;
        }

        const replyContainerEl = this.dialogEl.querySelector(`.${CLASS_REPLY_CONTAINER}`);
        if (!replyContainerEl) {
            return;
        }

        const replyTextEl = replyContainerEl.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
        const replyButtonEls = replyContainerEl.querySelector(constants.SELECTOR_BUTTON_CONTAINER);
        util.resetTextarea(replyTextEl, clearText);
        util.hideElement(replyButtonEls);
    }

    /**
     * Posts a reply in the dialog.
     *
     * @private
     * @return {void}
     */
    postReply() {
        const replyTextEl = this.element.querySelector(`.${CLASS_REPLY_TEXTAREA}`);
        const message = replyTextEl.value;
        if (message.trim() === '') {
            replyTextEl.classList.add(constants.CLASS_INVALID_INPUT);
            return;
        }

        this.emit('annotationcreate', message);
        replyTextEl.value = '';
        replyTextEl.focus();
    }

    /**
     * Broadcasts message to delete an annotation.
     *
     * @private
     * @param {Annotation} annotation annotation to delete
     * @return {void}
     */
    emitAnnotationDelete(annotation) {
        this.emit('annotationdelete', annotation);
    }

    /**
     * Generates the annotation dialog DOM element
     *
     * @private
     * @param {number} numAnnotations length of annotations array
     * @return {HTMLElement} Annotation dialog DOM element
     */
    generateDialogEl(numAnnotations) {
        const dialogEl = document.createElement('div');

        // Create Section including the create comment box
        if (this.canAnnotate) {
            const createSectionEl = document.createElement('section');
            createSectionEl.setAttribute('data-section', 'create');
            if (numAnnotations) {
                createSectionEl.classList.add(constants.CLASS_HIDDEN);
            }
            dialogEl.appendChild(createSectionEl);

            const createTextArea = document.createElement('textarea');
            createTextArea.classList.add(constants.CLASS_TEXTAREA);
            createTextArea.classList.add(constants.CLASS_ANNOTATION_TEXTAREA);
            createTextArea.placeholder = this.localized.addCommentPlaceholder;
            createSectionEl.appendChild(createTextArea);

            const createBtnsContainer = document.createElement('div');
            createBtnsContainer.classList.add(constants.CLASS_BUTTON_CONTAINER);
            createSectionEl.appendChild(createBtnsContainer);

            const cancelBtn = util.generateBtn(
                [constants.CLASS_BUTTON, constants.CLASS_ANNOTATION_BUTTON_CANCEL],
                this.localized.cancelButton,
                this.localized.cancelButton,
                constants.DATA_TYPE_CANCEL
            );
            createBtnsContainer.appendChild(cancelBtn);

            const postBtn = util.generateBtn(
                [constants.CLASS_BUTTON, constants.CLASS_BUTTON_PRIMARY, constants.CLASS_ANNOTATION_BUTTON_POST],
                this.localized.postButton,
                this.localized.postButton,
                constants.DATA_TYPE_POST
            );
            createBtnsContainer.appendChild(postBtn);
        }

        // Show section including the annotations container
        const showSectionEl = document.createElement('section');
        showSectionEl.setAttribute('data-section', 'show');
        if (!numAnnotations) {
            showSectionEl.classList.add(constants.CLASS_HIDDEN);
        }
        dialogEl.appendChild(showSectionEl);

        const showCommentsContainer = document.createElement('div');
        showCommentsContainer.classList.add(CLASS_COMMENTS_CONTAINER);
        showSectionEl.appendChild(showCommentsContainer);

        // Reply container including the reply text area and post/cancel buttons
        if (this.canAnnotate) {
            const replyContainer = document.createElement('div');
            replyContainer.classList.add(CLASS_REPLY_CONTAINER);
            showSectionEl.appendChild(replyContainer);

            const replyTextArea = document.createElement('textarea');
            replyTextArea.classList.add(constants.CLASS_TEXTAREA);
            replyTextArea.classList.add(constants.CLASS_ANNOTATION_TEXTAREA);
            replyTextArea.classList.add(CLASS_REPLY_TEXTAREA);
            replyTextArea.placeholder = this.localized.replyPlaceholder;
            replyTextArea.setAttribute('data-type', constants.DATA_TYPE_REPLY_TEXTAREA);
            replyContainer.appendChild(replyTextArea);

            const replyBtnsContainer = document.createElement('div');
            replyBtnsContainer.classList.add(constants.CLASS_BUTTON_CONTAINER);
            replyBtnsContainer.classList.add(constants.CLASS_HIDDEN);
            replyContainer.appendChild(replyBtnsContainer);

            const cancelBtn = util.generateBtn(
                [constants.CLASS_BUTTON, constants.CLASS_ANNOTATION_BUTTON_CANCEL],
                this.localized.cancelButton,
                this.localized.cancelButton,
                constants.DATA_TYPE_CANCEL_REPLY
            );
            replyBtnsContainer.appendChild(cancelBtn);

            const postBtn = util.generateBtn(
                [constants.CLASS_BUTTON, constants.CLASS_BUTTON_PRIMARY, constants.CLASS_ANNOTATION_BUTTON_POST],
                this.localized.postButton,
                this.localized.postButton,
                constants.DATA_TYPE_POST_REPLY
            );
            replyBtnsContainer.appendChild(postBtn);
        }

        return dialogEl;
    }

    /**
     * Flip the annotations dialog if the dialog would appear in the lower
     * half of the viewer
     *
     * @private
     * @param {number} yPos y coordinate for the top of the dialog
     * @param {number} containerHeight height of the current annotation
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

    /**
     * @param {Annotations[]} annotations List of annotations
     * @return {boolean} Whether or not the dialog contains any saved annotations
     */
    hasAnnotations(annotations) {
        return annotations && annotations.length > 0;
    }
}

export default AnnotationDialog;
