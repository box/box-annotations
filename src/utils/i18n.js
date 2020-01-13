/**
 * @flow
 * @file Exports language, messages and react-intl language data for internationalization
 * @author Box
 */

import annotationsLocaleData from 'box-annotations-locale-data'; // eslint-disable-line
import boxElementsMessages from 'box-elements-messages'; // eslint-disable-line
import localeData from 'react-intl-locale-data'; // eslint-disable-line

declare var __LANGUAGE__: string;

const language = __LANGUAGE__;
const messages = { ...annotationsLocaleData, ...boxElementsMessages };

export default { language, messages, localeData };
