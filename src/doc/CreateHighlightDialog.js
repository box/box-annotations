import CreateAnnotationDialog from '../CreateAnnotationDialog';
import { ICON_HIGHLIGHT, ICON_HIGHLIGHT_COMMENT } from '../icons/icons';
import { generateBtn, repositionCaret } from '../util';
import {
    CREATE_EVENT,
    CLASS_ANNOTATION_CARET,
    CLASS_HIGHLIGHT_BTNS,
    CLASS_ADD_HIGHLIGHT_BTN,
    CLASS_ADD_HIGHLIGHT_COMMENT_BTN,
    CLASS_ANNOTATION_HIGHLIGHT_DIALOG,
    SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG,
    SELECTOR_HIGHLIGHT_BTNS,
    SELECTOR_ADD_HIGHLIGHT_BTN,
    SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN,
    CLASS_MOBILE_ANNOTATION_DIALOG,
    CLASS_ANNOTATION_DIALOG,
    CLASS_BUTTON_PLAIN
} from '../constants';

const CLASS_CREATE_DIALOG = 'bp-create-annotation-dialog';
const DATA_TYPE_HIGHLIGHT = 'add-highlight-btn';
const DATA_TYPE_ADD_HIGHLIGHT_COMMENT = 'add-highlight-comment-btn';
const HIGHLIGHT_BTNS_WIDTH = 78;

class CreateHighlightDialog extends CreateAnnotationDialog {
    /** @property {HTMLElement} - Container element for the dialog. */
    containerEl;

    /** @property {HTMLElement} - The clickable element for creating plain highlights. */
    highlightCreateEl;

    /** @property {HTMLElement} - The clickable element got creating comment highlights. */
    commentCreateEl;

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

    /** @property {boolean} - Whether or not to allow plain highlight interaction. */
    allowHighlight;

    /** @property {boolean} - Whether or not to allow comment interactions. */
    allowComment;

    /** @property {Object} - Translated strings for dialog */
    localized;

    /**
     * A dialog used to create plain and comment highlights.
     *
     * [constructor]
     *
     * @param {HTMLElement} parentEl - Parent element
     * @param {Object} [config] - For configuring the dialog.
     * @param {boolean} [config.hasTouch] - True to add touch events.
     * @param {boolean} [config.isMobile] - True if on a mobile device.
     * @return {CreateHighlightDialog} CreateHighlightDialog instance
     */
    constructor(parentEl, config = {}) {
        super(parentEl, config);

        this.allowHighlight = config.allowHighlight || false;
        this.allowComment = config.allowComment || false;

        // Explicit scope binding for event listeners
        if (this.allowHighlight) {
            this.onHighlightClick = this.onHighlightClick.bind(this);
        }

        if (this.allowComment) {
            this.onCommentClick = this.onCommentClick.bind(this);
            this.onCommentPost = this.onCommentPost.bind(this);
            this.onCommentCancel = this.onCommentCancel.bind(this);
        }

        this.createElement();
    }

    /**
     * Show the dialog. Adds to the parent container if it isn't already there.
     *
     * @public
     * @param {HTMLElement} [newParentEl] - The new parent container to nest this in.
     * @return {void}
     */
    show(newParentEl) {
        super.show(newParentEl);

        // Add to parent if it hasn't been added already
        if (!this.parentEl.querySelector(`.${CLASS_CREATE_DIALOG}`)) {
            this.parentEl.appendChild(this.containerEl);
        }
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        super.destroy();

        // Event listeners
        if (this.highlightCreateEl) {
            this.highlightCreateEl.removeEventListener('click', this.onHighlightClick);
            this.highlightCreateEl.removeEventListener('touchstart', this.stopPropagation);
            this.highlightCreateEl.removeEventListener('touchend', this.onHighlightClick);
        }

        if (this.commentCreateEl) {
            this.commentCreateEl.removeEventListener('click', this.onCommentClick);
            this.commentCreateEl.removeEventListener('touchstart', this.stopPropagation);
            this.commentCreateEl.removeEventListener('touchend', this.onCommentClick);
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

        const dialogX = this.position.x - 1 - this.containerEl.clientWidth / 2;
        const xPos = repositionCaret(
            this.containerEl,
            dialogX,
            HIGHLIGHT_BTNS_WIDTH,
            this.position.x,
            this.parentEl.clientWidth
        );

        // Plus 1 pixel for caret
        this.containerEl.style.left = `${xPos}px`;
        // Plus 5 pixels for caret
        this.containerEl.style.top = `${this.position.y + 5}px`;
    }

    /**
     * Fire an event notifying that the plain highlight button has been clicked.
     *
     * @param {Event} event - The DOM event coming from interacting with the element.
     * @return {void}
     */
    onHighlightClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.emit(CREATE_EVENT.plain);
    }

    /**
     * Fire an event notifying that the comment button has been clicked. Also
     * show the comment box, and give focus to the text area conatined by it.
     *
     * @param {Event} event - The DOM event coming from interacting with the element.
     * @return {void}
     */
    onCommentClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.emit(CREATE_EVENT.comment);

        this.commentBox.show();
        this.commentBox.focus();
        this.setButtonVisibility(false);
        this.updatePosition();
    }

    /**
     * Create the element containing highlight create and comment buttons, and comment box.
     *
     * @private
     * @return {HTMLElement} The element containing Highlight creation UI
     */
    createElement() {
        this.containerEl = document.createElement('div');
        this.containerEl.classList.add(CLASS_CREATE_DIALOG);

        if (!this.isMobile) {
            const caretTemplate = document.createElement('div');
            caretTemplate.classList.add(CLASS_ANNOTATION_CARET);
            caretTemplate.left = '50%';
            this.containerEl.appendChild(caretTemplate);
        }

        const buttonsEl = document.createElement('span');
        buttonsEl.classList.add(CLASS_HIGHLIGHT_BTNS);

        if (this.allowHighlight) {
            const highlightEl = generateBtn(
                [CLASS_BUTTON_PLAIN, CLASS_ADD_HIGHLIGHT_BTN],
                this.localized.highlightToggle,
                ICON_HIGHLIGHT,
                DATA_TYPE_HIGHLIGHT
            );
            buttonsEl.appendChild(highlightEl);
        }

        if (this.allowComment) {
            const commentEl = generateBtn(
                [CLASS_BUTTON_PLAIN, CLASS_ADD_HIGHLIGHT_COMMENT_BTN],
                this.localized.highlightComment,
                ICON_HIGHLIGHT_COMMENT,
                DATA_TYPE_ADD_HIGHLIGHT_COMMENT
            );
            buttonsEl.appendChild(commentEl);
        }

        const dialogEl = document.createElement('div');
        dialogEl.classList.add(CLASS_ANNOTATION_HIGHLIGHT_DIALOG);
        dialogEl.appendChild(buttonsEl);
        this.containerEl.appendChild(dialogEl);

        // Get rid of the caret
        if (this.isMobile) {
            this.containerEl.classList.add(CLASS_MOBILE_ANNOTATION_DIALOG);
            this.containerEl.classList.add(CLASS_ANNOTATION_DIALOG);
        }

        const highlightDialogEl = this.containerEl.querySelector(SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG);

        // Reference HTML
        this.buttonsEl = highlightDialogEl.querySelector(SELECTOR_HIGHLIGHT_BTNS);

        // Stop interacting with this element from triggering outside actions
        this.containerEl.addEventListener('click', this.stopPropagation);
        this.containerEl.addEventListener('mouseup', this.stopPropagation);
        this.containerEl.addEventListener('dblclick', this.stopPropagation);

        // Events for highlight button
        if (this.allowHighlight) {
            this.highlightCreateEl = highlightDialogEl.querySelector(SELECTOR_ADD_HIGHLIGHT_BTN);
            this.highlightCreateEl.addEventListener('click', this.onHighlightClick);

            if (this.hasTouch) {
                this.highlightCreateEl.addEventListener('touchstart', this.stopPropagation);
                this.highlightCreateEl.addEventListener('touchend', this.onHighlightClick);
            }
        }

        // Events for comment button
        if (this.allowComment) {
            this.commentBox = this.setupCommentBox(highlightDialogEl);

            this.commentCreateEl = highlightDialogEl.querySelector(SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN);
            this.commentCreateEl.addEventListener('click', this.onCommentClick);

            if (this.hasTouch) {
                this.commentCreateEl.addEventListener('touchstart', this.stopPropagation);
                this.commentCreateEl.addEventListener('touchend', this.onCommentClick);
            }
        }

        // touch events
        if (this.hasTouch) {
            this.containerEl.addEventListener('touchend', this.stopPropagation);
        }
    }
}

export default CreateHighlightDialog;
