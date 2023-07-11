import { defineMessages } from 'react-intl';

export default defineMessages({
    ariaLabelComment: {
        id: 'ba.popups.comment',
        description: 'Aria label description for reply popup',
        defaultMessage: 'Comment',
    },
    buttonCancel: {
        id: 'ba.popups.cancel',
        description: 'Button label for cancelling the creation of a description, comment, or reply',
        defaultMessage: 'Cancel',
    },
    buttonPost: {
        id: 'ba.popups.post',
        description: 'Button label for creating a description, comment, or reply',
        defaultMessage: 'Post',
    },
    drawingButtonAddComment: {
        id: 'ba.popups.drawing.addComment',
        description: 'Button label for adding a comment in the drawing toolbar',
        defaultMessage: 'Add Comment',
    },
    drawingButtonDelete: {
        id: 'ba.popups.drawing.delete',
        description: 'Button title for deleting a staged drawing',
        defaultMessage: 'Delete',
    },
    drawingButtonRedo: {
        id: 'ba.popups.drawing.redo',
        description: 'Button title for redoing a staged drawing',
        defaultMessage: 'Redo',
    },
    drawingButtonUndo: {
        id: 'ba.popups.drawing.undo',
        description: 'Button title for undoing a staged drawing',
        defaultMessage: 'Undo',
    },
    fieldPlaceholder: {
        id: 'ba.popups.replyField.placeholder',
        description: 'Placeholder for reply field editor',
        defaultMessage: 'Type a comment...',
    },
    popupHighlightPromoter: {
        id: 'ba.popups.popupHighlight.promoter',
        description: 'Popup message for highlight promoter',
        defaultMessage: 'Highlight and Comment',
    },
    popupHighlightRestrictedPrompt: {
        id: 'ba.popups.popupHighlight.restrictedPrompt',
        description: 'Prompt message when selection crosses multiple pages',
        defaultMessage: 'Comments restricted to single page',
    },
    popupListPrompt: {
        id: 'ba.popups.popupList.prompt',
        description: 'Prompt message for empty popup list',
        defaultMessage: 'Mention someone to notify them',
    },
    regionCursorPrompt: {
        id: 'ba.popups.popupCursor.regionPrompt',
        description: 'Prompt message following cursor in region annotations mode',
        defaultMessage: 'Draw a box to comment',
    },
});
