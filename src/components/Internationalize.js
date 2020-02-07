/**
 * @flow
 * @file Wraps a component in an IntlProvider
 * @author Box
 */

import React, { Children } from 'react';
import { IntlProvider } from 'react-intl';

import i18n from '../utils/i18n';

type Props = {
    children?: any,
    messages: Object,
};

const Internationalize = ({ children, messages }: Props) => {
    const { getLocale, language } = i18n;
    const shouldInternationalize: boolean = !!language && !!messages;

    if (shouldInternationalize) {
        const locale = getLocale();
        return (
            <IntlProvider locale={locale} messages={messages}>
                {children}
            </IntlProvider>
        );
    }

    return Children.only(children);
};

export default Internationalize;
