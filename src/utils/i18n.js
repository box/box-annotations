/**
 * @flow
 * @file Exports language, messages and react-intl language data for internationalization
 * @author Box
 */

import annotationsLocaleData from 'box-annotations-locale-data'; // eslint-disable-line
import boxElementsMessages from 'box-elements-messages';
import { IntlProvider } from 'react-intl';

declare var __LANGUAGE__: string;

const language = __LANGUAGE__;
const annotationsMessages = { ...annotationsLocaleData, ...boxElementsMessages };
const getLocale = (lang: string = __LANGUAGE__) => {
    return lang.substr(0, lang.indexOf('-'));
};

const createIntlProvider = ({ messages = annotationsMessages, locale = getLocale() }: IntlOptions) => {
    return new IntlProvider({
        messages,
        locale,
    }).getChildContext().intl;
};

export default { language, getLocale, createIntlProvider };
