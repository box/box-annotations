import annotationsLocaleData from 'box-annotations-locale-data';
import boxElementsMessages from 'box-elements-messages';
import { createIntl, createIntlCache, IntlShape } from 'react-intl';
import { IntlOptions } from '../@types';

declare const __LANGUAGE__: string; // eslint-disable-line no-underscore-dangle

const getLocale = (language: string = __LANGUAGE__): string => {
    return language.substr(0, language.indexOf('-'));
};

if (!window.Intl.PluralRules) {
    require('@formatjs/intl-pluralrules/polyfill'); // eslint-disable-line
    require(`react-intl-pluralrules-locale-data`); // eslint-disable-line
}

if (!window.Intl.RelativeTimeFormat) {
    require('@formatjs/intl-relativetimeformat/polyfill'); // eslint-disable-line
    require('react-intl-relativetimeformat-locale-data'); // eslint-disable-line
}

const annotationsMessages = { ...annotationsLocaleData, ...boxElementsMessages };
const intlCache = createIntlCache();
const createIntlProvider = ({ language, locale, messages = annotationsMessages }: IntlOptions = {}): IntlShape => {
    return createIntl(
        {
            messages,
            locale: locale || getLocale(language),
        },
        intlCache,
    );
};

export default { createIntlProvider, getLocale };
