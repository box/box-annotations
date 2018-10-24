import React from 'react';
import noop from 'lodash/noop';
import { render, unmountComponentAtNode } from 'react-dom';
import EventEmitter from 'events';

import AnnotationPopover from '../components/AnnotationPopover';
import {
    repositionCaret,
    getPageInfo,
    findElement,
    getPopoverLayer,
    isInElement,
    getPageEl,
    shouldDisplayMobileUI
} from '../util';
import { getDialogCoordsFromRange } from './docUtil';
import { CREATE_EVENT, TYPES, PAGE_PADDING_TOP, PAGE_PADDING_BOTTOM } from '../constants';

class CreateHighlightDialog extends EventEmitter {
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

    /** @property {HTMLElement} - Preview container DOM element */
    container;

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
        this.container = config.container;
        this.hasTouch = !!config.hasTouch || false;
        this.localized = config.localized;
        this.allowHighlight = config.allowHighlight || false;
        this.allowComment = config.allowComment || false;
        this.headerHeight = config.headerHeight;
    }

    destroy() {
        this.unmountPopover();
    }

    unmountPopover() {
        this.isVisible = false;
        const popoverLayer = this.container.querySelector('.ba-dialog-layer');
        if (this.createPopoverComponent && popoverLayer) {
            unmountComponentAtNode(popoverLayer);
            this.createPopoverComponent = null;
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

        // Select page of first node selected
        this.selection = selection;
        this.pageInfo = getPageInfo(this.selection.anchorNode);
        if (!this.pageInfo.pageEl) {
            return;
        }

        if (shouldDisplayMobileUI(this.container)) {
            this.position = { x: 0, y: 0 };
        } else {
            this.setPosition(this.selection);
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
        const pageEl = shouldDisplayMobileUI(this.container)
            ? this.container
            : getPageEl(this.annotatedElement, this.pageInfo.page);
        const popoverLayer = getPopoverLayer(pageEl);

        this.createPopoverComponent = render(
            <AnnotationPopover
                type={type}
                canAnnotate={true}
                canComment={this.allowComment}
                canDelete={true}
                position={this.updatePosition}
                onDelete={noop}
                onCancel={this.onCommentCancel}
                onCreate={this.onCreate}
                onCommentClick={this.onCommentClick}
                isPending={true}
                isMobile={shouldDisplayMobileUI(this.container)}
                headerHeight={this.headerHeight}
            />,
            popoverLayer
        );
        this.isVisible = true;
    };

    /**
     * @param {Event} event - Mouse event
     * @return {boolean} Whether or not the click event occured over a highlight in the canvas
     */
    isInHighlight = (event) => {
        if (!this.selection || !this.selection.rangeCount) {
            return false;
        }

        const lastRange = this.selection.getRangeAt(this.selection.rangeCount - 1);
        return isInElement(event, lastRange);
    };

    /** @inheritdoc */
    setPosition(selection) {
        if (!this.selection || !this.selection.rangeCount) {
            return;
        }

        const lastRange = selection.getRangeAt(selection.rangeCount - 1);
        const coords = getDialogCoordsFromRange(lastRange);

        // Select page of first node selected
        this.pageInfo = getPageInfo(selection.anchorNode);
        const { pageEl } = this.pageInfo;
        if (!pageEl) {
            return;
        }

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

    /**
     * Update the position styling for the dialog so that the chevron points to
     * the desired location.
     *
     * @return {void}
     */
    updatePosition = () => {
        if (shouldDisplayMobileUI(this.container)) {
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
            return;
        }

        this.emit(CREATE_EVENT.commentPost, message);
    };

    /**
     * Fire an event notifying that the comment button has been clicked. Also
     * show the comment box, and give focus to the text area conatined by it.
     *
     * @return {void}
     */
    onCommentClick = () => {
        this.emit(CREATE_EVENT.comment);
        this.renderAnnotationPopover(TYPES.highlight_comment);
    };

    /**
     * Cancels adding a comment to the highlgiht annotation by rendering a plain highlight popover
     *
     * @return {void}
     */
    onCommentCancel = () => {
        this.renderAnnotationPopover(TYPES.highlight);
    };
}

export default CreateHighlightDialog;
