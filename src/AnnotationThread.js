// @flow
import EventEmitter from 'events';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import AnnotationAPI from './api/AnnotationAPI';
import * as util from './util';
import { ICON_PLACED_ANNOTATION } from './icons/icons';
import {
    CLASS_ANNOTATION_POINT_MARKER,
    CLASS_FLIPPED_POPOVER,
    DATA_TYPE_ANNOTATION_INDICATOR,
    STATES,
    THREAD_EVENT,
    TYPES
} from './constants';
import AnnotationPopover from './components/AnnotationPopover';

class AnnotationThread extends EventEmitter {
    /** @param {HTMLElement} */
    annotatedElement: HTMLElement;

    /** @param {Object} */
    annotations: Object;

    /** @param {AnnotationAPI} */
    api: AnnotationAPI;

    /** @param {string} */
    fileVersionId: string;

    /** @param {Location} */
    location: ?Location;

    /** @param {string} */
    threadID: ?string;

    /** @param {string} */
    threadNumber: string;

    /** @param {AnnotationType} */
    type: AnnotationType;

    /** @param {boolean} */
    canComment: boolean;

    /**
     * [constructor]
     *
     * @param {Object} data - Data for constructing thread
     * @return {AnnotationThread} Annotation thread instance
     */
    constructor(data: Object) {
        super();

        this.annotatedElement = data.annotatedElement;
        this.api = data.api;
        this.container = data.container;
        this.locale = data.locale;
        this.hasTouch = data.hasTouch || false;
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
        this.state = STATES.inactive;
        this.permissions = data.permissions;
        this.canDelete = data.canDelete;
        this.canAnnotate = data.canAnnotate;
        this.canComment = true;
        this.comments = data.comments
            ? data.comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            : [];

        // $FlowFixMe
        this.renderAnnotationPopover = this.renderAnnotationPopover.bind(this);
        // $FlowFixMe
        this.onCommentClick = this.onCommentClick.bind(this);
        // $FlowFixMe
        this.save = this.save.bind(this);
        // $FlowFixMe
        this.updateTemporaryAnnotation = this.updateTemporaryAnnotation.bind(this);
        // $FlowFixMe
        this.delete = this.delete.bind(this);

        this.regenerateBoundary();

        this.setup();
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        this.threadID = null;
        this.unmountPopover();
        this.unbindDOMListeners();

        if (this.element) {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }

            this.element = null;
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
        if (this.threadNumber) {
            // Saved thread
            this.state = STATES.inactive;
        } else {
            // Newly created thread
            this.state = STATES.pending;
        }
    }

    /**
     * Positions the annotation popover
     *
     * @return {void}
     */
    position = () => {
        throw new Error('Implement me!');
    };

    /**
     * Returns the parent element for the annotation popover
     *
     * @return {HTMLElement} Parent element for the annotation popover
     */
    getPopoverParent() {
        if (!this.location || !this.location.page) {
            return this.annotatedElement;
        }

        return util.shouldDisplayMobileUI(this.container)
            ? this.container
            : // $FlowFixMe
            util.getPageEl(this.annotatedElement, this.location.page);
    }

    /**
     * Shows the appropriate annotation dialog for this thread.
     *
     * @param {Event} event - Mouse event
     * @return {void}
     */
    renderAnnotationPopover(event: ?Event = null) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        const isPending = this.state === STATES.pending;

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
    }

    /**
     * Resets and unmounts the annotation popover
     *
     * @return {void}
     */
    unmountPopover() {
        this.reset();
        this.toggleFlippedThreadEl();

        const popoverLayers = this.container.querySelectorAll('.ba-dialog-layer');
        if (!this.popoverComponent || popoverLayers.length === 0) {
            return;
        }

        popoverLayers.forEach(unmountComponentAtNode);
        this.popoverComponent = null;
    }

    /**
     * Saves an annotation.
     *
     * @param {AnnotationType} type - Type of annotation
     * @param {string} message - Text of annotation to save
     * @return {Promise} - Annotation create promise
     */
    save(type: AnnotationType, message: string): Promise<any> {
        this.emit(THREAD_EVENT.create);

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
            createdAt: new Date().toISOString()
        });

        this.state = STATES.inactive;
        this.renderAnnotationPopover();

        // Save annotation on server
        return (
            this.api
                // $FlowFixMe
                .create(annotationData)
                .then((savedAnnotation) => this.updateTemporaryAnnotation(id, savedAnnotation))
                .catch((error) => this.handleThreadSaveError(error, id))
        );
    }

    /**
     * Update the annotation thread instance with annotation data/comments
     *
     * @param {Object} data - Annotation data
     * @return {void}
     */
    updateAnnotationThread(data: Object) {
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
     * Does nothing by default
     *
     * @return {void}
     */
    onCommentClick() {}

    /**
     * Deletes an annotation.
     *
     * @param {Object} annotationToRemove - annotation to delete
     * @param {boolean} [useServer] - Whether or not to delete on server, default true
     * @return {Promise} - Annotation delete promise
     */
    delete(annotationToRemove: Object, useServer: boolean = true): Promise<any> {
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

        this.cleanupAnnotationOnDelete(annotationIDToRemove);

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
            .then(this.deleteSuccessHandler)
            .catch(this.deleteErrorHandler);
    }

    /**
     * Appropriately cleanup the AnnotationThread instance based on the delete action
     *
     * @param {string} annotationIDToRemove Annotation ID to remove
     * @return {void}
     */
    cleanupAnnotationOnDelete(annotationIDToRemove: string) {
        // Delete matching comment from annotation
        this.comments = this.comments.filter(({ id }) => id !== annotationIDToRemove);

        if (this.canDelete && this.comments.length <= 0) {
            // If this annotation was the last one in the thread, destroy the thread
            this.threadID = null;
        } else {
            // Otherwise, display annotation with deleted comment
            this.renderAnnotationPopover();
        }
    }

    /**
     * Handles the successful delete of an annotation or one of it's comments
     *
     * @return {void}
     */
    deleteSuccessHandler = () => {
        if (this.threadID) {
            this.emit(THREAD_EVENT.deleteComment);
            this.renderAnnotationPopover();
        } else {
            this.emit(THREAD_EVENT.delete);
            this.destroy();
        }
    };

    /**
     * Handles annotation delete errors
     *
     * @param {Error} error Delete error
     * @return {void}
     */
    deleteErrorHandler(error: Error) {
        // Re-render page
        this.emit(THREAD_EVENT.render, this.location);

        // Broadcast error
        this.emit(THREAD_EVENT.deleteError);
        console.error(THREAD_EVENT.deleteError, error.toString()); // eslint-disable-line no-console
    }

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

    /**
     * Sets up the thread. Creates HTML for annotation indicator, sets
     * appropriate dialog, and binds event listeners.
     *
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
     * @return {void}
     */
    setupElement() {
        this.element = this.createElement();
        this.bindDOMListeners();
    }

    /**
     * Binds DOM event listeners for the thread.
     *
     * @return {void}
     */
    bindDOMListeners() {
        if (this.element) {
            this.element.addEventListener('click', this.renderAnnotationPopover);
        }
    }

    /**
     * Unbinds DOM event listeners for the thread.
     *
     * @return {void}
     */
    unbindDOMListeners() {
        if (this.element) {
            this.element.removeEventListener('click', this.renderAnnotationPopover);
        }
    }

    /**
     * Destroys mobile and pending/pending-active annotation threads
     *
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

    /**
     * Scroll annotation into the center of the viewport, if possible
     *
     * @return {void}
     */
    scrollIntoView() {
        // $FlowFixMe
        const yPos = parseInt(this.location.y, 10);
        this.scrollToPage();
        this.centerAnnotation(this.annotatedElement.scrollTop + yPos);
    }

    /**
     * Scroll to the annotation's page
     *
     * @return {void}
     */
    scrollToPage() {
        // Ignore if annotation does not have a location or page
        if (!this.location || !this.location.page) {
            return;
        }

        const pageEl = util.getPageEl(this.annotatedElement, this.location.page);
        if (pageEl) {
            pageEl.scrollIntoView();
        }
    }

    /**
     * Adjust page scroll position so annotation is centered in viewport
     *
     * @param {number} scrollVal - scroll value to adjust so annotation is
     centered in the viewport
     * @return {void}
     */
    centerAnnotation(scrollVal: number) {
        if (scrollVal < this.annotatedElement.scrollHeight) {
            this.annotatedElement.scrollTop = scrollVal;
        } else {
            // $FlowFixMe
            this.annotatedElement.scrollTop = this.annotatedElement.scrollBottom;
        }
    }

    /**
     * Update a temporary annotation with the annotation saved on the backend. Set the threadNumber if it has not
     * yet been set. Propogate the threadnumber to an attached dialog if applicable.
     *
     * @param {string} tempAnnotationID - The locally stored placeholder for the server validated annotation
     * @param {Annotation} savedAnnotation - The annotation determined by the backend to be used as the source of truth
     * @return {void}
     */
    updateTemporaryAnnotation(tempAnnotationID: string, savedAnnotation: Annotation) {
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
     * @return {HTMLElement} HTML element
     */
    createElement(): HTMLElement {
        const indicatorEl = document.createElement('button');
        indicatorEl.classList.add(CLASS_ANNOTATION_POINT_MARKER);
        indicatorEl.setAttribute('data-type', DATA_TYPE_ANNOTATION_INDICATOR);
        indicatorEl.innerHTML = ICON_PLACED_ANNOTATION;
        return indicatorEl;
    }

    /**
     * Create an annotation data object to pass to annotation service.
     *
     * @param {AnnotationType} type - Type of annotation
     * @param {string} message - Annotation text
     * @return {Object} Annotation data
     */
    createAnnotationData(type: AnnotationType, message: string) {
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
            createdBy: this.api.user,
            thread: this.threadNumber
        };
    }

    /**
     * Creates a new point annotation
     *
     * @param {string} message - Annotation message string
     * @return {void}
     */
    createAnnotation(message: string) {
        this.save(TYPES.point, message);
    }

    /**
     * Regenerate the coordinates of the rectangular boundary on the saved thread for inserting into the rtree
     *
     * @return {void}
     */
    regenerateBoundary() {
        // $FlowFixMe
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
     * @param {error} error - error thrown while saving the annotation
     * @param {string} tempAnnotationID - ID of temporary annotation to be updated with annotation from server
     * @return {void}
     */
    handleThreadSaveError(error: Error, tempAnnotationID: string) {
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
     * @return {Object} threadData - Annotation event thread data
     */
    getThreadEventData(): Object {
        const threadData = {
            type: this.type,
            threadID: this.threadID
        };

        // $FlowFixMe
        if (this.api.user && this.api.user.id > 0) {
            // $FlowFixMe
            threadData.userId = this.api.user.id;
        }

        if (this.threadNumber) {
            // $FlowFixMe
            threadData.threadNumber = this.threadNumber;
        }

        return threadData;
    }

    /**
     * Emits a generic viewer event
     *
     * @emits viewerevent
     * @param {string} event - Event name
     * @param {Object} eventData - Event data
     * @return {void}
     */
    emit(event: Event, eventData: ?Object) {
        const threadData = this.getThreadEventData();
        super.emit(event, { data: threadData, eventData });
        super.emit('threadevent', { event, data: threadData, eventData });
    }

    /**
     * Show/hide the top portion of the annotations icon based on if the
     * entire dialog is flipped
     *
     * @return {void}
     */
    toggleFlippedThreadEl() {
        if (this.element) {
            const isDialogFlipped = this.element.classList.contains(CLASS_FLIPPED_POPOVER);
            if (isDialogFlipped) {
                this.element.classList.remove(CLASS_FLIPPED_POPOVER);
            }
        }
    }
}

export default AnnotationThread;
