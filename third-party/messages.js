/* eslint-disable max-len */
/**
 * @flow
 * @file i18n messages from Box UI Elements
 * @author Box
 */

import { defineMessages } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';

const messages: { [string]: MessageDescriptor } = defineMessages({
    approvalAddTask: {
        id: 'be.approvalAddTask',
        defaultMessage: 'Add Task',
        description: 'Label for checkbox to add approvers to a comment'
    },
    approvalAddTaskTooltip: {
        id: 'be.approvalAddTaskTooltip',
        defaultMessage:
            'Assigning a task to someone will send them a notification with the message in the comment box and allow them to approve or deny.',
        description: 'Tooltip text for checkbox to add approvers to a comment'
    },
    approvalAssignees: {
        id: 'be.approvalAssignees',
        defaultMessage: 'Assignees',
        description: 'Title for assignees input'
    },
    approvalDueDate: {
        id: 'be.approvalDueDate',
        defaultMessage: 'Due Date',
        description: 'Title for approvers due date input'
    },
    approvalSelectDate: {
        id: 'be.approvalSelectDate',
        defaultMessage: 'Select a date',
        description: 'Placeholder for due date input'
    },
    atMentionTip: {
        id: 'be.atMentionTip',
        defaultMessage: '@mention users to notify them.',
        description:
            'Mentioning call to action displayed below the comment input'
    },
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
        defaultMessage: 'Write a comment',
        description: 'Placeholder for comment input'
    },
    deleteLabel: {
        id: 'be.deleteLabel',
        defaultMessage: 'Delete',
        description: 'Aria label for button to delete a comment or task'
    }
});

export default messages;
