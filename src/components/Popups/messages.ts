import { defineMessages } from 'react-intl';

export default defineMessages({
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
    fieldPlaceholder: {
        id: 'ba.popups.replyField.placeholder',
        description: 'Placeholder for reply field editor',
        defaultMessage: 'Type a comment...',
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
