// @flow
import * as React from 'react';

import OverlayComponent from 'box-react-ui/lib/components/flyout/Overlay';

type Props = {
    shouldDefaultFocus: boolean,
    children: React.Node
};

const Overlay = ({ shouldDefaultFocus, children }: Props) => {
    if (shouldDefaultFocus) {
        return (
            <OverlayComponent className='ba-popover-overlay' shouldOutlineFocus={false}>
                {children}
            </OverlayComponent>
        );
    }

    return <div className='ba-popover-overlay'>{children}</div>;
};

export default Overlay;
