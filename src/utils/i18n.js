/**
 * @flow
 * @file Exports language, messages and react-intl language data for internationalization
 * @author Box
 */

import annotationsLocaleData from 'box-annotations-locale-data'; // eslint-disable-line
import boxElementsMessages from 'box-elements-messages';
import { createIntl, createIntlCache } from 'react-intl';

declare var __LANGUAGE__: string;

const language = __LANGUAGE__;
const getLocale = (lang: string = language) => {
    return lang.substr(0, lang.indexOf('-'));
};

if (!window.Intl.PluralRules) {
    require('@formatjs/intl-pluralrules/polyfill'); // eslint-disable-line

    // $FlowFixMe
    require(`react-intl-pluralrules-locale-data`); // eslint-disable-line
}

if (!window.Intl.RelativeTimeFormat) {
    require('@formatjs/intl-relativetimeformat/polyfill'); // eslint-disable-line

    // $FlowFixMe
    require('react-intl-relativetimeformat-locale-data'); // eslint-disable-line
}

const annotationsMessages = { ...annotationsLocaleData, ...boxElementsMessages };
const intlCache = createIntlCache();
const createIntlProvider = ({ locale = getLocale(), messages = annotationsMessages }: IntlOptions) => {
    return createIntl(
        {
            messages,
            locale,
        },
        intlCache,
    );
};

export default { createIntlProvider, getLocale, language };
