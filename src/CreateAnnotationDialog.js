import EventEmitter from 'events';
import CommentBox from './CommentBox';
import { hideElement, showElement } from './annotatorUtil';
import {
    CLASS_MOBILE_CREATE_ANNOTATION_DIALOG,
    CLASS_ANNOTATION_DIALOG,
    CLASS_CREATE_DIALOG,
    CREATE_EVENT
} from './annotationConstants';

class CreateAnnotationDialog extends EventEmitter {
    /** @property {HTMLElement} - Container element for the dialog. */
    containerEl;

    /** @property {HTMLElement} - The parent container to nest the dialog element in. */
    parentEl;

    /** @property {HTMLElement} - The element containing the buttons that can creaet highlights. */
    buttonsEl;

    /** @property {CommentBox} - The comment box instance. Contains area for text input and post/cancel buttons. */
    commentBox;

    /** @property {Object} - Position, on the DOM, to align the dialog to the end of a highlight. */
    position = {
        x: 0,
        y: 0
    };

    /** @property {boolean} - Whether or not we're on a mobile device. */
    isMobile;

    /** @property {boolean} - Whether or not we support touch. */
    hasTouch;

    /** @property {boolean} - Whether or not this is visible. */
    isVisible;

    /**
     * A dialog used to create plain and comment highlights.
     *
     * [constructor]
     *
     * @param {HTMLElement} parentEl - Parent element
     * @param {Object} [config] - For configuring the dialog.
     * @param {boolean} [config.hasTouch] - True to add touch events.
     * @param {boolean} [config.isMobile] - True if on a mobile device.
     * @return {CreateAnnotationDialog} CreateAnnotationDialog instance
     */
    constructor(parentEl, config = {}) {
        super();

        this.parentEl = parentEl;
        this.isMobile = config.isMobile || false;
        this.hasTouch = config.hasTouch || false;
        this.localized = config.localized;

        this.containerEl = this.createElement();
    }

    /**
     * Set the parent container to next this dialog in.
     *
     * @public
     * @param {HTMLElement} newParentEl - The element that will contain this.
     * @return {void}
     */
    setParentEl(newParentEl) {
        this.parentEl = newParentEl;
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
     * Show the dialog. Adds to the parent container if it isn't already there.
     *
     * @public
     * @param {HTMLElement} [newParentEl] - The new parent container to nest this in.
     * @return {void}
     */
    show(newParentEl) {
        this.isVisible = true;
        if (!this.containerEl) {
            this.containerEl = this.createElement();
        }

        // Move to the correct parent element
        if (newParentEl) {
            this.setParentEl(newParentEl);
        }

        // Add to parent if it hasn't been added already
        if (!this.parentEl.querySelector(`.${CLASS_CREATE_DIALOG}`)) {
            this.parentEl.appendChild(this.containerEl);
        }

        this.setButtonVisibility(true);

        showElement(this.containerEl);
        this.emit(CREATE_EVENT.init);

        this.commentBox.show();
        this.commentBox.focus();
    }

    /**
     * Hide the dialog, and clear out the comment box text entry.
     *
     * @return {void}
     */
    hide() {
        this.isVisible = false;
        if (!this.containerEl) {
            return;
        }

        hideElement(this.containerEl);

        if (this.commentBox) {
            this.commentBox.clear();
        }
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        if (!this.containerEl) {
            return;
        }

        this.hide();

        // Stop interacting with this element from triggering outside actions
        this.containerEl.removeEventListener('click', this.stopPropagation);
        this.containerEl.removeEventListener('mouseup', this.stopPropagation);
        this.containerEl.removeEventListener('dblclick', this.stopPropagation);

        // Event listeners
        if (this.hasTouch) {
            this.containerEl.removeEventListener('touchend', this.stopPropagation);
        }

        this.containerEl.remove();
        this.containerEl = null;
        this.parentEl = null;

        if (this.commentBox) {
            this.commentBox.removeListener(CommentBox.CommentEvents.post, this.onCommentPost);
            this.commentBox.removeListener(CommentBox.CommentEvents.cancel, this.onCommentCancel);
            this.commentBox.destroy();
            this.commentBox = null;
        }
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
    updatePosition() {
        if (this.isMobile) {
            return;
        }

        // Plus 1 pixel for caret
        this.containerEl.style.left = `${this.position.x - 1 - this.containerEl.clientWidth / 2}px`;
        // Plus 5 pixels for caret
        this.containerEl.style.top = `${this.position.y + 5}px`;
    }

    /**
     * Fire an event notifying that the post button has been pressed. Clears
     * out the comment box.
     *
     * @param {string} text - Text entered into the comment box
     * @return {void}
     */
    onCommentPost(text) {
        this.emit(CREATE_EVENT.post, text);
        this.hide();
    }

    /**
     * The cancel button has been pressed. Close the comment box, and return to
     * default state.
     *
     * @return {void}
     */
    onCommentCancel() {
        this.setButtonVisibility(true);
        this.updatePosition();
    }

    /**
     * Hide or show the plain and comment buttons, in the dialog.
     *
     * @param {boolean} visible - If true, shows the plain and comment buttons
     * @return {void}
     */
    setButtonVisibility(visible) {
        if (visible) {
            showElement(this.buttonsEl);
        } else {
            hideElement(this.buttonsEl);
        }
    }

    /**
     * Stop the dialog from propagating events to parent container. Pairs with
     * giving focus to the text area in the comment box and clicking "Post".
     *
     * @param {Event} event - The DOM event coming from interacting with the element.
     * @return {void}
     */
    stopPropagation(event) {
        event.stopPropagation();
    }

    /**
     * Create the element containing highlight create and comment buttons, and comment box.
     *
     * @private
     * @return {HTMLElement} The element containing Highlight creation UI
     */
    createElement() {
        // Create comment box
        this.commentBox = new CommentBox(this.containerEl, {
            hasTouch: this.hasTouch,
            localized: this.localized
        });

        // Event listeners
        this.commentBox.addListener(CommentBox.CommentEvents.post, this.onCommentPost.bind(this));
        this.commentBox.addListener(CommentBox.CommentEvents.cancel, this.onCommentCancel.bind(this));

        const containerEl = document.createElement('div');
        containerEl.classList.add(CLASS_MOBILE_CREATE_ANNOTATION_DIALOG);
        containerEl.classList.add(CLASS_ANNOTATION_DIALOG);
        containerEl.appendChild(this.commentBox.containerEl);

        // Stop interacting with this element from triggering outside actions
        containerEl.addEventListener('click', this.stopPropagation);
        containerEl.addEventListener('mouseup', this.stopPropagation);
        containerEl.addEventListener('dblclick', this.stopPropagation);

        // touch events
        if (this.hasTouch) {
            containerEl.addEventListener('touchend', this.stopPropagation);
        }

        // Hide create dialog, by default
        this.commentBox.show();
        hideElement(containerEl);

        return containerEl;
    }
}

export default CreateAnnotationDialog;
