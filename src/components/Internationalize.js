/**
 * @flow
 * @file Wraps a component in an IntlProvider
 * @author Box
 */

import React from 'react';
import { IntlProvider } from 'react-intl';
import i18n from '../utils/i18n';

type Props = {
    children?: any,
    intl: Object,
};

const Internationalize = ({ children, intl }: Props) => {
    return (
        <IntlProvider {...intl} locale={i18n.getLocale()}>
            {children}
        </IntlProvider>
    );
};

export default Internationalize;
