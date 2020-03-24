import annotationsLocaleData from 'box-annotations-locale-data'; // eslint-disable-line
import boxElementsMessages from 'box-elements-messages';
import { createIntl, createIntlCache, IntlShape } from 'react-intl';

type IntlOptions = {
    messages: Record<string, string>;
    language?: string;
    locale?: string;
};

declare const __LANGUAGE__: string; // eslint-disable-line no-underscore-dangle

const language = __LANGUAGE__;
const getLocale = (lang: string = language): string => {
    return lang.substr(0, lang.indexOf('-'));
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
const createIntlProvider = ({ locale = getLocale(), messages = annotationsMessages }: IntlOptions): IntlShape => {
    return createIntl(
        {
            messages,
            locale,
        },
        intlCache,
    );
};

export default { createIntlProvider, getLocale, language };
