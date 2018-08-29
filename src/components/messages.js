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
        description: 'Button text to cancel annotation deletion'
    },
    commentDeleteConfirm: {
        id: 'be.commentDeleteConfirm',
        defaultMessage: 'Yes',
        description: 'Button text to confirm annotation deletion'
    },
    commentDeletePrompt: {
        id: 'be.commentDeletePrompt',
        defaultMessage: 'Delete annotation?',
        description: 'Confirmation prompt text to delete annotation'
    },
    commentPost: {
        id: 'be.commentPost',
        defaultMessage: 'Post',
        description: 'Text for post button'
    },
    commentShowOriginal: {
        id: 'be.commentShowOriginal',
        defaultMessage: 'Show Original',
        description: 'Show original button for showing original annotation'
    },
    commentTranslate: {
        id: 'be.commentTranslate',
        defaultMessage: 'Translate',
        description: 'Translate button for translating annotation'
    },
    commentWrite: {
        id: 'be.commentWrite',
        defaultMessage: 'Add an annotation',
        description: 'Placeholder for annotation input'
    },
    commentPostedFullDateTime: {
        id: 'be.commentPostedFullDateTime',
        defaultMessage: '{time, date, full} at {time, time, short}',
        description: 'Comment posted full date time for title'
    },
    commentCreateErrorMessage: {
        id: 'be.commentCreateErrorMessage',
        description: 'Error message when an annotation creation fails',
        defaultMessage: 'There was an error creating this annotation.'
    },
    commentCreateConflictMessage: {
        id: 'be.commentCreateConflictMessage',
        description: 'Error message when an annotation creation fails due to a conflict',
        defaultMessage: 'This annotation already exists.'
    },
    commentDeleteErrorMessage: {
        id: 'be.commentDeleteErrorMessage',
        description: 'Error message when an annotation deletion fails',
        defaultMessage: 'There was an error deleting this annotation.'
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
