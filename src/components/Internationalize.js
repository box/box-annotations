/**
 * @flow
 * @file Wraps a component in an IntlProvider
 * @author Box
 */

import React, { Children } from 'react';
import { IntlProvider, addLocaleData } from 'react-intl';

import i18n from '../utils/i18n';

type Props = {
    children?: any,
};

addLocaleData(i18n.localeData);

const Internationalize = ({ children }: Props) => {
    const { language, messages } = i18n;
    const shouldInternationalize: boolean = !!language && !!messages;

    if (shouldInternationalize) {
        const locale = language && language.substr(0, language.indexOf('-'));
        return (
            <IntlProvider locale={locale} messages={messages}>
                {children}
            </IntlProvider>
        );
    }

    return Children.only(children);
};

export default Internationalize;
