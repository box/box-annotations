import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';
import PopupBase from '../PopupBase';
import { Options, PopupReference } from '../Popper';

import './PopupList.scss';

export type Props = {
    reference: PopupReference;
};

const options: Partial<Options> = {
    modifiers: [
        {
            name: 'offset',
            options: {
                offset: [0, 3],
            },
        },
        {
            name: 'eventListeners',
            options: {
                scroll: false,
            },
        },
    ],
    placement: 'bottom-start',
};

const PopupList = ({ reference, ...rest }: Props): JSX.Element => (
    <PopupBase className="ba-PopupList" options={options} reference={reference} {...rest}>
        <div className="ba-PopupList-prompt ba-PopupList-item">
            <FormattedMessage {...messages.popupListPrompt} />
        </div>
    </PopupBase>
);

export default PopupList;
