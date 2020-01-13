/**
 * @file Translate button component used by Comment Text component
 */

/* eslint-disable */
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

import PlainButton from 'box-ui-elements/es/components/plain-button';

import messages from '../../messages';

type Props = {
    handleTranslate: Function
};

const TranslateButton = ({ handleTranslate }: Props): React.Node => (
    <PlainButton className="bcs-comment-translate" onClick={handleTranslate}>
        <FormattedMessage {...messages.commentTranslate} />
    </PlainButton>
);

export default TranslateButton;
