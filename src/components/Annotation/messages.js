/* eslint-disable max-len */
/**
 * @flow
 * @file i18n messages
 * @author Box
 */

import { defineMessages } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';

const messages: { [string]: MessageDescriptor } = defineMessages({
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
