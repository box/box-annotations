// @flow
import * as React from 'react';

import OverlayComponent from 'box-react-ui/lib/components/flyout/Overlay';

const CLASS_POPOVER_OVERLAY = 'ba-popover-overlay';

type Props = {
    shouldDefaultFocus: boolean,
    children: React.Node
};

const Overlay = ({ shouldDefaultFocus, children }: Props) => {
    if (shouldDefaultFocus) {
        return (
            <OverlayComponent className={CLASS_POPOVER_OVERLAY} shouldOutlineFocus={false}>
                {children}
            </OverlayComponent>
        );
    }

    return <div className={CLASS_POPOVER_OVERLAY}>{children}</div>;
};

export default Overlay;
