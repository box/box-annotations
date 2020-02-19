/**
 * @flow
 * @file Wraps a component in an IntlProvider
 * @author Box
 */

import React from 'react';
import { RawIntlProvider } from 'react-intl';

type Props = {
    children?: any,
    intl: Object,
};

const Internationalize = ({ children, intl }: Props) => {
    return <RawIntlProvider value={intl}>{children}</RawIntlProvider>;
};

export default Internationalize;
