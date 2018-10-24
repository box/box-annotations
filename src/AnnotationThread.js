import EventEmitter from 'events';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import AnnotationAPI from './api/AnnotationAPI';
import * as util from './util';
import { ICON_PLACED_ANNOTATION } from './icons/icons';
import {
    ANNOTATION_POPOVER_CARET_HEIGHT,
    CLASS_ANNOTATION_POINT_MARKER,
    CLASS_FLIPPED_DIALOG,
    CLASS_HIDDEN,
    DATA_TYPE_ANNOTATION_INDICATOR,
    PAGE_PADDING_BOTTOM,
    PAGE_PADDING_TOP,
    POINT_ANNOTATION_ICON_DOT_HEIGHT,
    SELECTOR_ANNOTATION_CARET,
    STATES,
    THREAD_EVENT,
    TYPES,
    SELECTOR_CLASS_ANNOTATION_POPOVER
} from './constants';
import AnnotationPopover from './components/AnnotationPopover';

class AnnotationThread extends EventEmitter {
    //--------------------------------------------------------------------------
    // Typedef
    //--------------------------------------------------------------------------

    /**
     * The data object for constructing a thread.
     * @typedef {Object} AnnotationThreadData
     * @property {HTMLElement} annotatedElement HTML element being annotated on
     * @property {Object} [annotations] Annotations in thread - none if
     * this is a new thread
     * @property {AnnotationAPI} api Annotations CRUD API
     * @property {string} fileVersionId File version ID
     * @property {Object} location Location object
     * @property {string} threadID Thread ID
     * @property {string} threadNumber Threadnumber
     * @property {string} type Type of thread
     * @property {boolean} canComment Whether or not the annotation allows the addition of comments
     */

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * [constructor]
     *
     * @param {AnnotationThreadData} data - Data for constructing thread
     * @return {AnnotationThread} Annotation thread instance
     */
    constructor(data) {
        super();

        this.annotatedElement = data.annotatedElement;
        this.api = data.api;
        this.container = data.container;
        this.fileVersionId = data.fileVersionId;
        this.location = data.location;
        this.threadID = data.threadID || AnnotationAPI.generateID();
        this.threadNumber = data.threadNumber || '';
        this.type = data.type;
        this.locale = data.locale;
        this.hasTouch = data.hasTouch || false;
        this.permissions = data.permissions;
        this.state = STATES.inactive;
        this.canComment = true;
        this.headerHeight = data.headerHeight;

        this.id = data.id;
        this.type = data.type;
        this.location = data.location;
        this.threadNumber = data.threadNumber;
        this.createdAt = data.createdAt;
        this.createdBy = data.createdBy;
        this.modifiedAt = data.modifiedAt;
        this.fileVersionId = data.fileVersionId;
        this.threadID = data.threadID || AnnotationAPI.generateID();
        this.canDelete = data.canDelete;
        this.canAnnotate = data.canAnnotate;
        this.canComment = true;
        this.comments = data.comments
            ? data.comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            : [];

        this.regenerateBoundary();

        this.setup();
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        this.unmountPopover();

        if (this.element) {
            this.unbindDOMListeners();

            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }

            this.element = null;
        }

        if (this.state !== STATES.pending) {
            this.emit(THREAD_EVENT.threadDelete);
        }
    }

    /**
     * Hides the annotation indicator.
     *
     * @return {void}
     */
    hide() {
        this.state = STATES.inactive;
        this.unmountPopover();
    }

    /**
     * Reset state to inactive.
     *
     * @return {void}
     */
    reset() {
        this.state = STATES.inactive;
    }

    position = () => {
        /* eslint-enable no-unused-vars */
        throw new Error('Implement me!');
    };

    getPopoverParent() {
        return util.shouldDisplayMobileUI(this.container)
            ? this.container
            : util.getPageEl(this.annotatedElement, this.location.page);
    }

    /**
     * Shows the appropriate annotation dialog for this thread.
     *
     * @param {Event} event - Mouse event
     * @return {void}
     */
    renderAnnotationPopover(event = null) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        const isPending = this.state === STATES.pending;
        this.onCommentClick = this.onCommentClick.bind(this);
        this.save = this.save.bind(this);
        this.updateTemporaryAnnotation = this.updateTemporaryAnnotation.bind(this);
        this.delete = this.delete.bind(this);

        const pageEl = this.getPopoverParent();
        this.popoverComponent = render(
            <AnnotationPopover
                id={this.id}
                type={this.type}
                isMobile={util.shouldDisplayMobileUI(this.container)}
                createdAt={this.createdAt}
                createdBy={this.createdBy}
                modifiedAt={this.modifiedAt}
                canAnnotate={this.canAnnotate}
                canDelete={this.canDelete}
                canComment={this.canComment}
                comments={this.comments}
                position={this.position}
                onDelete={this.delete}
                onCancel={this.cancelUnsavedAnnotation}
                onCreate={this.save}
                onCommentClick={this.onCommentClick}
                isPending={isPending}
                headerHeight={this.headerHeight}
            />,
            util.getPopoverLayer(pageEl)
        );
        this.position();
    }

    unmountPopover() {
        this.reset();

        const pageEl = this.getPopoverParent();
        const popoverLayer = pageEl.querySelector('.ba-dialog-layer');
        if (this.popoverComponent && popoverLayer) {
            unmountComponentAtNode(popoverLayer);
            this.popoverComponent = null;
        }
    }

    /**
     * Saves an annotation.
     *
     * @param {string} type - Type of annotation
     * @param {string} message - Text of annotation to save
     * @return {Promise} - Annotation create promise
     */
    save(type, message) {
        const annotationData = this.createAnnotationData(type, message);

        // Save annotation on client
        const id = AnnotationAPI.generateID();
        this.updateAnnotationThread({
            id,
            message,
            permissions: {
                can_edit: true,
                can_delete: true
            },
            createdBy: this.api.user,
            createdAt: new Date().toLocaleString()
        });

        this.state = STATES.inactive;
        this.renderAnnotationPopover();

        // Save annotation on server
        return this.api
            .create(annotationData)
            .then((savedAnnotation) => this.updateTemporaryAnnotation(id, savedAnnotation))
            .catch((error) => this.handleThreadSaveError(error, id));
    }

    updateAnnotationThread(data) {
        if (!this.threadNumber) {
            this.id = data.id;
            this.threadNumber = data.threadNumber;
            this.threadID = data.threadID;
        }

        // If annotation is the first in the thread
        const { message } = data;
        if (message && message.trim() !== '') {
            this.comments.push(data);
        } else {
            this.createdAt = data.createdAt;
            this.createdBy = data.createdBy;
            this.modifiedAt = data.modifiedAt;
        }
    }

    /**
     * Fire an event notifying that the comment button has been clicked. Also
     * show the comment box, and give focus to the text area conatined by it.
     *
     * @param {Event} event - The DOM event coming from interacting with the element.
     * @return {void}
     */
    onCommentClick() {
        if (!this.threadNumber) {
            this.saveAnnotation(TYPES.highlight);
        }
        this.type = TYPES.highlight_comment;
        this.renderAnnotationPopover();
    }

    /**
     * Deletes an annotation.
     *
     * @param {Object} annotationToRemove - annotation to delete
     * @param {boolean} [useServer] - Whether or not to delete on server, default true
     * @return {Promise} - Annotation delete promise
     */
    delete(annotationToRemove, useServer = true) {
        // Ignore if no corresponding annotation exists in thread or user doesn't have permissions
        const { id: annotationIDToRemove } = annotationToRemove;
        const annotation =
            annotationIDToRemove !== this.id ? this.comments.find(({ id }) => id === annotationIDToRemove) : this;
        if (!annotation) {
            // Broadcast error
            this.emit(THREAD_EVENT.deleteError);
            /* eslint-disable no-console */
            console.error(THREAD_EVENT.deleteError, `Annotation with ID ${annotationIDToRemove} could not be found.`);
            /* eslint-enable no-console */
            return Promise.reject();
        }

        if (annotation.permissions && !annotation.permissions.can_delete) {
            // Broadcast error
            this.emit(THREAD_EVENT.deleteError);
            /* eslint-disable no-console */
            console.error(
                THREAD_EVENT.deleteError,
                `User does not have the correct permissions to delete annotation with ID ${annotation.id}.`
            );
            /* eslint-enable no-console */
            return Promise.reject();
        }

        // Delete matching comment from annotation
        this.comments = this.comments.filter(({ id }) => id !== annotationIDToRemove);

        if (this.type === TYPES.highlight && !this.canDelete) {
            // If the user doesn't have permission to delete the entire highlight
            // annotation, display the annotation as a plain highlight
            this.cancelFirstComment();
        } else if (this.type === TYPES.highlight || this.type === TYPES.draw || this.comments.length <= 0) {
            // If this annotation was the last one in the thread, destroy the thread
            this.destroy();
            this.threadID = null;
        } else {
            // Otherwise, display annotation with deleted comment
            this.renderAnnotationPopover();
        }

        if (!useServer) {
            /* eslint-disable no-console */
            console.error(
                THREAD_EVENT.deleteError,
                `Annotation with ID ${annotation.threadNumber} not deleted from server`
            );
            /* eslint-enable no-console */
            return Promise.resolve();
        }

        // Delete annotation on server
        return this.api
            .delete(annotationIDToRemove)
            .then(() => {
                // Ensures that blank highlight comment is also deleted when removing
                // the last comment on a highlight
                if (this.type === TYPES.highlight && this.canDelete) {
                    this.api.delete(this.id).then(() => {
                        // Broadcast thread cleanup if needed
                        if (!this.threadID) {
                            this.emit(THREAD_EVENT.reset);
                        } else {
                            // Broadcast annotation deletion event
                            this.emit(THREAD_EVENT.delete);
                        }

                        this.threadID = null;
                    });
                }

                // Broadcast annotation deletion event
                this.emit(THREAD_EVENT.delete);
            })
            .catch((error) => {
                // Broadcast error
                this.emit(THREAD_EVENT.deleteError);
                /* eslint-disable no-console */
                console.error(THREAD_EVENT.deleteError, error.toString());
                /* eslint-enable no-console */
            });
    }

    //--------------------------------------------------------------------------
    // Abstract
    //--------------------------------------------------------------------------

    /**
     * Cancels the first comment on the thread
     *
     * @return {void}
     */
    cancelFirstComment() {}

    /**
     * Must be implemented to show the annotation indicator.
     *
     * @return {void}
     */
    show() {}

    //--------------------------------------------------------------------------
    // Protected
    //--------------------------------------------------------------------------

    /**
     * Sets up the thread. Creates HTML for annotation indicator, sets
     * appropriate dialog, and binds event listeners.
     *
     * @protected
     * @return {void}
     */
    setup() {
        if (this.threadNumber) {
            this.state = STATES.inactive;
        } else {
            this.state = STATES.pending;
        }

        this.setupElement();
    }

    /**
     * Sets up indicator element.
     *
     * @protected
     * @return {void}
     */
    setupElement() {
        this.element = this.createElement();
        this.bindDOMListeners();
    }

    /**
     * Binds DOM event listeners for the thread.
     *
     * @protected
     * @return {void}
     */
    bindDOMListeners() {
        if (!this.element) {
            return;
        }

        this.renderAnnotationPopover = this.renderAnnotationPopover.bind(this);
        this.element.addEventListener('click', this.renderAnnotationPopover);
    }

    /**
     * Unbinds DOM event listeners for the thread.
     *
     * @protected
     * @return {void}
     */
    unbindDOMListeners() {
        if (!this.element) {
            return;
        }

        this.element.removeEventListener('click', this.renderAnnotationPopover);
    }

    /**
     * Destroys mobile and pending/pending-active annotation threads
     *
     * @protected
     * @return {void}
     */
    cancelUnsavedAnnotation = () => {
        if (this.state !== STATES.pending) {
            this.unmountPopover();
            return;
        }

        this.emit(THREAD_EVENT.cancel);
        this.destroy();
    };

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Scroll annotation into the center of the viewport, if possible
     *
     * @private
     * @return {void}
     */
    scrollIntoView() {
        const yPos = parseInt(this.location.y, 10);
        this.scrollToPage();
        this.centerAnnotation(this.annotatedElement.scrollTop + yPos);
    }

    /**
     * Scroll to the annotation's page
     *
     * @private
     * @return {void}
     */
    scrollToPage() {
        // Ignore if annotation does not have a location or page
        if (!this.location || !this.location.page) {
            return;
        }

        const pageEl = this.getPopoverParent();
        pageEl.scrollIntoView();
    }

    /**
     * Adjust page scroll position so annotation is centered in viewport
     *
     * @private
     * @param {number} scrollVal - scroll value to adjust so annotation is
     centered in the viewport
     * @return {void}
     */
    centerAnnotation(scrollVal) {
        if (scrollVal < this.annotatedElement.scrollHeight) {
            this.annotatedElement.scrollTop = scrollVal;
        } else {
            this.annotatedElement.scrollTop = this.annotatedElement.scrollBottom;
        }
    }

    /**
     * Update a temporary annotation with the annotation saved on the backend. Set the threadNumber if it has not
     * yet been set. Propogate the threadnumber to an attached dialog if applicable.
     *
     * @private
     * @param {string} tempAnnotationID - The locally stored placeholder for the server validated annotation
     * @param {Annotation} savedAnnotation - The annotation determined by the backend to be used as the source of truth
     * @return {void}
     */
    updateTemporaryAnnotation(tempAnnotationID, savedAnnotation) {
        if (this.comments.length > 0) {
            this.comments = this.comments.filter(({ id }) => id !== tempAnnotationID);
        }

        this.updateAnnotationThread(savedAnnotation);

        if (util.shouldDisplayMobileUI(this.container)) {
            // Changing state from pending
            this.state = STATES.active;
        } else {
            this.state = STATES.inactive;
        }

        this.show();
        this.renderAnnotationPopover();
        this.emit(THREAD_EVENT.save);
    }

    /**
     * Creates the HTML for the annotation indicator.
     *
     * @private
     * @return {HTMLElement} HTML element
     */
    createElement() {
        const indicatorEl = document.createElement('button');
        indicatorEl.classList.add(CLASS_ANNOTATION_POINT_MARKER);
        indicatorEl.setAttribute('data-type', DATA_TYPE_ANNOTATION_INDICATOR);
        indicatorEl.innerHTML = ICON_PLACED_ANNOTATION;
        return indicatorEl;
    }

    /**
     * Create an annotation data object to pass to annotation service.
     *
     * @private
     * @param {string} type - Type of annotation
     * @param {string} message - Annotation text
     * @return {Object} Annotation data
     */
    createAnnotationData(type, message) {
        return {
            item: {
                id: this.fileVersionId,
                type: 'file_version'
            },
            details: {
                type,
                location: this.location,
                threadID: this.threadID
            },
            message,
            createdBy: this.api.user
        };
    }

    /**
     * Creates a new point annotation
     *
     * @private
     * @param {string} message - Annotation message string
     * @return {void}
     */
    createAnnotation(message) {
        this.save(TYPES.point, message);
    }

    /**
     * Regenerate the coordinates of the rectangular boundary on the saved thread for inserting into the rtree
     *
     * @private
     * @return {void}
     */
    regenerateBoundary() {
        if (!this.location || !this.location.x || !this.location.y) {
            return;
        }

        this.minX = this.location.x;
        this.maxX = this.location.x;
        this.minY = this.location.y;
        this.maxY = this.location.y;
    }

    /**
     * Deletes the temporary annotation if the annotation failed to save on the server
     *
     * @private
     * @param {error} error - error thrown while saving the annotation
     * @param {string} tempAnnotationID - ID of temporary annotation to be updated with annotation from server
     * @return {void}
     */
    handleThreadSaveError(error, tempAnnotationID) {
        // Remove temporary annotation
        this.delete({ id: tempAnnotationID }, /* useServer */ false);

        // Broadcast error
        this.emit(THREAD_EVENT.createError);

        /* eslint-disable no-console */
        console.error(THREAD_EVENT.createError, error.toString());
        /* eslint-enable no-console */
    }

    /**
     * Generate threadData with relevant information to be emitted with an
     * annotation thread event
     *
     * @private
     * @return {Object} threadData - Annotation event thread data
     */
    getThreadEventData() {
        const threadData = {
            type: this.type,
            threadID: this.threadID
        };

        if (this.api.user && this.api.user.id > 0) {
            threadData.userId = this.api.user.id;
        }

        if (this.threadNumber) {
            threadData.threadNumber = this.threadNumber;
        }

        return threadData;
    }

    /**
     * Emits a generic viewer event
     *
     * @private
     * @emits viewerevent
     * @param {string} event - Event name
     * @param {Object} eventData - Event data
     * @return {void}
     */
    emit(event, eventData) {
        const threadData = this.getThreadEventData();
        super.emit(event, { data: threadData, eventData });
        super.emit('threadevent', { event, data: threadData, eventData });
    }

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
        }
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
        const popoverEl = util.findElement(
            this.annotatedElement,
            SELECTOR_CLASS_ANNOTATION_POPOVER,
            this.renderAnnotationPopover
        );
        const annotationCaretEl = popoverEl.querySelector(SELECTOR_ANNOTATION_CARET);
        let top = '';
        let bottom = '';

        if (yPos <= containerHeight / 2) {
            // Keep dialog below the icon if in the top half of the viewport
            top = `${yPos - POINT_ANNOTATION_ICON_DOT_HEIGHT}px`;
            bottom = '';

            popoverEl.classList.remove(CLASS_FLIPPED_DIALOG);

            annotationCaretEl.style.bottom = '';
        } else {
            // Flip dialog to above the icon if in the lower half of the viewport
            const flippedY = containerHeight - yPos + ANNOTATION_POPOVER_CARET_HEIGHT;
            top = '';
            bottom = `${flippedY}px`;

            popoverEl.classList.add(CLASS_FLIPPED_DIALOG);

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

        if (this.element.classList.contains(CLASS_HIDDEN)) {
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
        const popoverEl = util.findElement(
            this.annotatedElement,
            SELECTOR_CLASS_ANNOTATION_POPOVER,
            this.renderAnnotationPopover
        );
        const maxHeight = this.container.clientHeight / 2 - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM;
        popoverEl.style.maxHeight = `${maxHeight}px`;
    }
}

export default AnnotationThread;
