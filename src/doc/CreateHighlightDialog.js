import React from 'react';
import noop from 'lodash/noop';
import { render, unmountComponentAtNode } from 'react-dom';
import EventEmitter from 'events';

import AnnotationPopover from '../components/AnnotationPopover';
import { repositionCaret, getPageInfo, findElement } from '../util';
import { getDialogCoordsFromRange } from './docUtil';
import { CREATE_EVENT, TYPES, PAGE_PADDING_TOP, PAGE_PADDING_BOTTOM } from '../constants';

class CreateHighlightDialog extends EventEmitter {
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
     * @param {HTMLElement} annotatedElement - Parent element
     * @param {Object} [config] - For configuring the dialog.
     * @param {boolean} [config.hasTouch] - True to add touch events.
     * @param {boolean} [config.isMobile] - True if on a mobile device.
     * @return {CreateHighlightDialog} CreateHighlightDialog instance
     */
    constructor(annotatedElement, config = {}) {
        super();

        this.annotatedElement = annotatedElement;
        this.isMobile = !!config.isMobile || false;
        this.hasTouch = !!config.hasTouch || false;
        this.localized = config.localized;
        this.allowHighlight = config.allowHighlight || false;
        this.allowComment = config.allowComment || false;
    }

    destroy() {
        this.unmountPopover();
    }

    unmountPopover() {
        if (this.createPopoverComponent && this.parentEl) {
            unmountComponentAtNode(this.parentEl);
            this.createPopoverComponent = null;
            this.containerEl = null;
        }
    }

    /**
     * Render the popover
     *
     * @public
     * @param {HTMLElement} selection Current text selection
     * @param {string} type - highlight type
     * @return {void}
     */
    show(selection, type = TYPES.highlight) {
        if (!selection) {
            return;
        }

        if (!this.isMobile) {
            this.setPosition(selection);
        }

        this.renderAnnotationPopover(type);
    }

    /**
     * Shows the appropriate annotation dialog for this thread.
     *
     * @param {string} type - annotation type
     * @param {HTMLElement} pageEl - Page DOM Element
     * @return {void}
     */
    renderAnnotationPopover = (type = TYPES.highlight) => {
        const pageEl = this.annotatedElement.querySelector(`[data-page-number="${this.pageNum}"]`);
        this.parentEl = pageEl.querySelector('.ba-dialog-layer');

        this.createPopoverComponent = render(
            <AnnotationPopover
                type={type}
                canAnnotate={true}
                canComment={this.allowComment}
                canDelete={this.allowHighlight}
                position={this.updatePosition}
                onDelete={noop}
                onCancel={this.onCancel}
                onCreate={this.onCreate}
                onCommentClick={this.onCommentClick}
                isPending={true}
            />,
            this.parentEl
        );
        this.containerEl = this.parentEl.querySelector('.ba-create-popover');
    };

    /** @inheritdoc */
    setPosition(selection) {
        if (!selection || !selection.rangeCount) {
            return;
        }

        const lastRange = selection.getRangeAt(selection.rangeCount - 1);
        const coords = getDialogCoordsFromRange(lastRange);

        // Select page of first node selected
        this.pageInfo = getPageInfo(selection.anchorNode);
        const { pageEl, page } = this.pageInfo;
        if (!pageEl) {
            return;
        }

        this.pageNum = page;
        const popoverEl = findElement(this.annotatedElement, '.ba-popover', this.renderAnnotationPopover);
        const popoverDimensions = popoverEl.getBoundingClientRect();
        const pageDimensions = pageEl.getBoundingClientRect();
        const pageLeft = pageDimensions.left;
        const pageTop = pageDimensions.top - popoverDimensions.height;
        this.position = {
            x: coords.x - pageLeft,
            y: coords.y - pageTop
        };
        this.updatePosition();
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

        // Position it below lower right corner or center of the highlight - we need
        // to reposition every time since the DOM could have changed from
        // zooming
        const { pageEl } = this.pageInfo;
        const pageDimensions = pageEl.getBoundingClientRect();
        const pageHeight = pageDimensions.height - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM;
        const BOUNDARY_PADDING = 5;

        const popoverEl = findElement(this.annotatedElement, '.ba-popover', this.renderAnnotationPopover);
        const dialogDimensions = popoverEl.getBoundingClientRect();
        const dialogWidth = dialogDimensions.width;
        let dialogX = this.position.x - dialogWidth / 2;
        let dialogY = this.position.y - dialogDimensions.height + BOUNDARY_PADDING;
        // Only reposition if one side is past page boundary - if both are,
        // just center the dialog and cause scrolling since there is nothing
        // else we can do
        dialogX = repositionCaret(popoverEl, dialogX, dialogWidth, this.position.x, pageDimensions.width);

        if (dialogY < 0) {
            dialogY = 0;
        } else if (dialogY > pageHeight) {
            dialogY = pageHeight - dialogDimensions.height;
        }

        popoverEl.style.left = `${dialogX}px`;
        popoverEl.style.top = `${dialogY}px`;
    };

    /**
     * Fire an event notifying that the plain highlight button has been clicked.
     *
     * @param {string} type - Annotation type
     * @param {string} message - Annotation message
     * @return {void}
     */
    onCreate = (type, message) => {
        if (!message) {
            this.emit(CREATE_EVENT.plain);
        }
    };

    /**
     * Fire an event notifying that the comment button has been clicked. Also
     * show the comment box, and give focus to the text area conatined by it.
     *
     * @param {Event} event - The DOM event coming from interacting with the element.
     * @return {void}
     */
    onCommentClick = () => {
        this.onCreate(TYPES.highlight);
        this.emit(CREATE_EVENT.comment);
        this.renderAnnotationPopover(TYPES.highlight_comment);
    };
}

export default CreateHighlightDialog;
