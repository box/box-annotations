/* eslint-disable max-len */
/**
 * @flow
 * @file i18n messages
 * @author Box
 */

import { defineMessages } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';

const messages: { [string]: MessageDescriptor } = defineMessages({
    annotationPostedFullDateTime: {
        id: 'ba.annotationPostedFullDateTime',
        defaultMessage: '{time, date, full} at {time, time, short}',
        description: 'Annotation posted full date time for title'
    },
    annotationDeletePrompt: {
        id: 'ba.annotationDeletePrompt',
        defaultMessage: 'Delete annotation?',
        description: 'Confirmation prompt text to delete annotation'
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
    highlightannotationToggle: {
        id: 'ba.highlightannotation',
        description: 'Highlight annotation annotation toggle',
        defaultMessage: 'Add annotation to highlighted text'
    },
    drawToggle: {
        id: 'ba.drawToggle',
        description: 'Drawing annotation mode toggle',
        defaultMessage: 'Drawing annotation mode'
    }
});

export default messages;
