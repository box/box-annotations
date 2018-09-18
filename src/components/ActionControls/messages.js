/* eslint-disable max-len */
/**
 * @flow
 * @file i18n messages
 * @author Box
 */

import { defineMessages } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';

const messages: { [string]: MessageDescriptor } = defineMessages({
    anonymousUserName: {
        id: 'ba.anonymousUserName',
        description: 'Placeholder when the current annotation\'s user information is unknown',
        defaultMessage: 'Some User'
    },
    whoHighlighted: {
        id: 'ba.whoHighlighted',
        description: 'Label for who highlighted the annotated text',
        defaultMessage: '{name} highlighted'
    },
    whoDrew: {
        id: 'ba.whoDrew',
        description: 'Label for who drew the drawing annotation',
        defaultMessage: '{name} drew'
    }
});

export default messages;
