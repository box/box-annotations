// @flow
/**
 * Wrapper component for styleguidist examples
 */
// $FlowFixMe
import 'core-js'; // For IE11
import * as React from 'react';
import { IntlProvider } from 'react-intl';

type Props = {
    children: React.Node
};

const Wrapper = ({ children }: Props) => (
    <IntlProvider locale='en' textComponent={React.Fragment}>
        <div className='ba'>{children}</div>
    </IntlProvider>
);

export default Wrapper;
