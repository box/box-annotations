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
        description: "Placeholder when the current annotation's user information is unknown",
        defaultMessage: 'Some User',
    },
});

export default messages;
