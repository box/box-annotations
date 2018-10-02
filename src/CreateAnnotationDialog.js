import EventEmitter from 'events';
import React from 'react';
import noop from 'lodash/noop';
import { render, unmountComponentAtNode } from 'react-dom';

import AnnotationPopover from './components/AnnotationPopover';
import { CREATE_EVENT, TYPES } from './constants';
import { findElement } from './util';

class CreateAnnotationDialog extends EventEmitter {
    /** @property {HTMLElement} - Container element for the dialog. */
    containerEl;

    /** @property {HTMLElement} - The parent container to nest the dialog element in. */
    parentEl;

    /** @property {Object} - Position, on the DOM, to align the dialog to the end of a highlight. */
    position = {
        x: 0,
        y: 0
    };

    /** @property {boolean} - Whether or not we're on a mobile device. */
    isMobile;

    /** @property {boolean} - Whether or not we support touch. */
    hasTouch;

    /**
     * A dialog used to create plain and comment highlights.
     *
     * [constructor]
     *
     * @param {HTMLElement} annotatedElement - Parent element
     * @param {Object} [config] - For configuring the dialog.
     * @param {boolean} [config.hasTouch] - True to add touch events.
     * @param {boolean} [config.isMobile] - True if on a mobile device.
     * @return {CreateAnnotationDialog} CreateAnnotationDialog instance
     */
    constructor(annotatedElement, config = {}) {
        super();

        this.annotatedElement = annotatedElement;
        this.isMobile = !!config.isMobile || false;
        this.hasTouch = !!config.hasTouch || false;
        this.localized = config.localized;
    }

    /**
     * Set the coordinates to position the dialog at, and force an update.
     *
     * @public
     * @param {number} x - The x coordinate to position the dialog at
     * @param {number} y - The y coordinate to position the dialog at
     * @return {void}
     */
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.updatePosition();
    }

    /**
     * Shows the appropriate annotation dialog for this thread.
     *
     * @param {string} type - annotation type
     * @return {void}
     */
    renderAnnotationPopover(type = TYPES.point, pageEl = this.annotatedElement) {
        this.parentEl = pageEl.querySelector('.ba-dialog-layer');

        this.popoverComponent = render(
            <AnnotationPopover
                type={type}
                canAnnotate={true}
                canDelete={true}
                position={this.updatePosition}
                onDelete={noop}
                onCancel={this.onCancel}
                onCreate={this.onCreate}
                isPending={true}
            />,
            this.parentEl
        );
        this.containerEl = this.parentEl.querySelector('.ba-create-popover');
    }

    unmountPopover() {
        if (this.popoverComponent && this.parentEl) {
            unmountComponentAtNode(this.parentEl);
            this.popoverComponent = null;
            this.containerEl = null;
        }
    }

    /**
     * Show the dialog. Adds to the parent container if it isn't already there.
     *
     * @public
     * @return {void}
     */
    show() {
        this.renderAnnotationPopover();
        this.emit(CREATE_EVENT.init);
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        this.unmountPopover();
        this.parentEl = null;
    }

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Update the position styling for the dialog so that the chevron points to
     * the desired location.
     *
     * @return {void}
     */
    updatePosition = () => {
        if (this.isMobile) {
            return;
        }

        const popoverEl = findElement(this.annotatedElement, '.ba-popover', this.renderAnnotationPopover);

        // Plus 1 pixel for caret
        popoverEl.style.left = `${this.position.x - 1 - popoverEl.clientWidth / 2}px`;
        // Plus 5 pixels for caret
        popoverEl.style.top = `${this.position.y + 5}px`;
    };

    /**
     * Fire an event notifying that the post button has been pressed. Clears
     * out the comment box.
     *
     * @param {string} text - Text entered into the comment box
     * @return {void}
     */
    onCreate = (type, text) => {
        if (text) {
            this.emit(CREATE_EVENT.post, text);
        }
        this.unmountPopover();
    };

    /**
     * The cancel button has been pressed. Close the comment box, and return to
     * default state.
     *
     * @return {void}
     */
    onCancel = () => {
        this.emit(CREATE_EVENT.cancel);
        this.unmountPopover();
    };
}

export default CreateAnnotationDialog;
