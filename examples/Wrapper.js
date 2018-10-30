// @flow
/**
 * Wrapper component for styleguidist examples
 */
// $FlowFixMe
import 'core-js'; // For IE11
import * as React from 'react';

import Internationalize from '../src/components/Internationalize';

import './Examples.scss';

type Props = {
    children: React.Node
};

const Wrapper = ({ children }: Props) => (
    <Internationalize>
        {children}
    </Internationalize>
);

export default Wrapper;
