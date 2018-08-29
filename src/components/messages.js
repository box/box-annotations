/* eslint-disable max-len */
/**
 * @flow
 * @file i18n messages
 * @author Box
 */

import { defineMessages } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';

const messages: { [string]: MessageDescriptor } = defineMessages({
    commentCancel: {
        id: 'ba.commentCancel',
        defaultMessage: 'Cancel',
        description: 'Text for cancel button'
    },
    commentDeleteCancel: {
        id: 'ba.commentDeleteCancel',
        defaultMessage: 'No',
        description: 'Button text to cancel annotation deletion'
    },
    commentDeleteConfirm: {
        id: 'ba.commentDeleteConfirm',
        defaultMessage: 'Yes',
        description: 'Button text to confirm annotation deletion'
    },
    commentDeletePrompt: {
        id: 'ba.commentDeletePrompt',
        defaultMessage: 'Delete annotation?',
        description: 'Confirmation prompt text to delete annotation'
    },
    commentPost: {
        id: 'ba.commentPost',
        defaultMessage: 'Post',
        description: 'Text for post button'
    },
    commentShowOriginal: {
        id: 'ba.commentShowOriginal',
        defaultMessage: 'Show Original',
        description: 'Show original button for showing original annotation'
    },
    commentTranslate: {
        id: 'ba.commentTranslate',
        defaultMessage: 'Translate',
        description: 'Translate button for translating annotation'
    },
    commentWrite: {
        id: 'ba.commentWrite',
        defaultMessage: 'Add an annotation',
        description: 'Placeholder for annotation input'
    },
    commentPostedFullDateTime: {
        id: 'ba.commentPostedFullDateTime',
        defaultMessage: '{time, date, full} at {time, time, short}',
        description: 'Comment posted full date time for title'
    },
    commentCreateErrorMessage: {
        id: 'ba.commentCreateErrorMessage',
        description: 'Error message when an annotation creation fails',
        defaultMessage: 'There was an error creating this annotation.'
    },
    commentCreateConflictMessage: {
        id: 'ba.commentCreateConflictMessage',
        description: 'Error message when an annotation creation fails due to a conflict',
        defaultMessage: 'This annotation already exists.'
    },
    commentDeleteErrorMessage: {
        id: 'ba.commentDeleteErrorMessage',
        description: 'Error message when an annotation deletion fails',
        defaultMessage: 'There was an error deleting this annotation.'
    },
    deleteLabel: {
        id: 'ba.deleteLabel',
        defaultMessage: 'Delete',
        description: 'Aria label for button to delete a comment or task'
    },
    editLabel: {
        id: 'ba.editLabel',
        defaultMessage: 'Edit',
        description: 'Aria label for button to edit a comment or task'
    },
    loadErrorMessage: {
        id: 'ba.loadErrorMessage',
        description: 'Error when annotations fail to load',
        defaultMessage: 'We\'re sorry, annotations failed to load for this file.'
    },
    authErrorMessage: {
        id: 'ba.authErrorMessage',
        description: 'Error when the user\'s token has expired',
        defaultMessage: 'Your session has expired. Please refresh the page.'
    },
    posting: {
        id: 'ba.posting',
        description: 'Placeholder when the annotation is pending',
        defaultMessage: 'Posting...'
    },
    anonymousUserName: {
        id: 'ba.anonymousUserName',
        description: 'Placeholder when the current annotation\'s user information is unknown',
        defaultMessage: 'Some User'
    },
    pointToggle: {
        id: 'ba.pointToggle',
        description: 'Point annotation mode toggle',
        defaultMessage: 'Point annotation mode'
    },
    highlightToggle: {
        id: 'ba.highlightToggle',
        description: 'Plain highlight annotation toggle',
        defaultMessage: 'Highlight tex'
    },
    highlightCommentToggle: {
        id: 'ba.highlightComment',
        description: 'Highlight comment annotation toggle',
        defaultMessage: 'Add comment to highlighted text'
    },
    whoHighlighted: {
        id: 'ba.whoHighlighted',
        description: 'Label for who highlighted the annotated text',
        defaultMessage: '{1} highlighted'
    },
    drawToggle: {
        id: 'ba.drawToggle',
        description: 'Drawing annotation mode toggle',
        defaultMessage: 'Drawing annotation mode'
    },
    whoDrew: {
        id: 'ba.whoDrew',
        description: 'Label for who drew the drawing annotation',
        defaultMessage: '{1} drew'
    }
});

export default messages;
