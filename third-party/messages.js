/* eslint-disable max-len */
/**
 * @flow
 * @file i18n messages from Box UI Elements
 * @author Box
 */

import { defineMessages } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';

const messages: { [string]: MessageDescriptor } = defineMessages({
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
    deleteLabel: {
        id: 'be.deleteLabel',
        defaultMessage: 'Delete',
        description: 'Aria label for button to delete a comment or task'
    },
});

export default messages;
