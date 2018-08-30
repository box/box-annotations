/* eslint-disable max-len */
/**
 * @flow
 * @file i18n messages from Box UI Elements
 * @author Box
 */

import { defineMessages } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';

const messages: { [string]: MessageDescriptor } = defineMessages({
    commentCancel: {
        id: 'be.commentCancel',
        defaultMessage: 'Cancel',
        description: 'Text for cancel button'
    },
    commentDeleteCancel: {
        id: 'be.commentDeleteCancel',
        defaultMessage: 'No',
        description: 'Button text to cancel comment deletion'
    },
    commentDeleteConfirm: {
        id: 'be.commentDeleteConfirm',
        defaultMessage: 'Yes',
        description: 'Button text to confirm comment deletion'
    },
    commentPost: {
        id: 'be.commentPost',
        defaultMessage: 'Post',
        description: 'Text for post button'
    },
    commentShowOriginal: {
        id: 'be.commentShowOriginal',
        defaultMessage: 'Show Original',
        description: 'Show original button for showing original comment'
    },
    commentTranslate: {
        id: 'be.commentTranslate',
        defaultMessage: 'Translate',
        description: 'Translate button for translating comment'
    },
    commentWrite: {
        id: 'be.commentWrite',
        defaultMessage: 'Add a comment',
        description: 'Placeholder for comment input'
    },
    commentCreateErrorMessage: {
        id: 'be.commentCreateErrorMessage',
        description: 'Error message when a comment creation fails',
        defaultMessage: 'There was an error creating this comment.'
    },
    commentCreateConflictMessage: {
        id: 'be.commentCreateConflictMessage',
        description: 'Error message when a comment creation fails due to a conflict',
        defaultMessage: 'This comment already exists.'
    },
    commentDeleteErrorMessage: {
        id: 'be.commentDeleteErrorMessage',
        description: 'Error message when a comment deletion fails',
        defaultMessage: 'There was an error deleting this comment.'
    },
    deleteLabel: {
        id: 'be.deleteLabel',
        defaultMessage: 'Delete',
        description: 'Aria label for button to delete a comment or task'
    },
    editLabel: {
        id: 'be.editLabel',
        defaultMessage: 'Edit',
        description: 'Aria label for button to edit a comment or task'
    }
});

export default messages;
