import { defineMessages } from 'react-intl';

export default defineMessages({
    ariaLabelComment: {
        id: 'ba.popup.reply.comment',
        description: 'Aria label description for reply popup',
        defaultMessage: 'Comment',
    },
    ariaLabelMentionLoading: {
        id: 'ba.popup.reply.mentionLoading',
        description: 'Aria label for mention selector loading state',
        defaultMessage: 'Loading users...',
    },
    ariaLabelMentionSelector: {
        id: 'ba.popup.reply.mentionSelector',
        description: 'Aria role description for mention user selector',
        defaultMessage: 'Mention a collaborator',
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
    drawingToolbarLabel: {
        id: 'ba.popups.drawing.toolbar',
        description: 'Accessible name for the toolbar shown over a staged drawing',
        defaultMessage: 'Drawing actions',
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
    regionCursorPrompt: {
        id: 'ba.popups.popupCursor.regionPrompt',
        description: 'Prompt message following cursor in region annotations mode',
        defaultMessage: 'Draw a box to comment',
    },
});
