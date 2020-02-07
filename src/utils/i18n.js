/**
 * @flow
 * @file Exports language, messages and react-intl language data for internationalization
 * @author Box
 */

import annotationsLocaleData from 'box-annotations-locale-data'; // eslint-disable-line
import boxElementsMessages from 'box-elements-messages'; // eslint-disable-line
import localeData from 'react-intl-locale-data';
import { IntlProvider, addLocaleData } from 'react-intl';

declare var __LANGUAGE__: string;

let language = __LANGUAGE__;
const messages = { ...annotationsLocaleData, ...boxElementsMessages };
const getLocale = (locale?: string) => {
    let lang = locale;

    if (!lang) {
        lang = language;
    }

    return lang.substr(0, lang.indexOf('-'));
};

const createIntlProvider = ({ provider, language: lang, intlLocaleData }: IntlOptions): IntlContext => {
    addLocaleData(intlLocaleData || localeData);

    if (provider && lang) {
        language = lang;
        return provider.getChildContext().intl;
    }
    return new IntlProvider(
        {
            locale: getLocale(),
            messages,
        },
        {},
    ).getChildContext().intl;
};

export default { language, messages, localeData, getLocale, createIntlProvider };
