import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import PopupBase from './PopupBase';
import { Options } from './Popper';
import { Shape } from '../../@types/model';
import './PopupHighlightError.scss';

export type Props = {
    shape: Shape;
};

const options: Partial<Options> = {
    modifiers: [
        {
            name: 'arrow',
            options: {
                element: '.ba-Popup-arrow',
            },
        },
        {
            name: 'eventListeners',
            options: {
                scroll: false,
            },
        },
        {
            name: 'offset',
            options: {
                offset: [0, 8],
            },
        },
        {
            name: 'preventOverflow',
            options: {
                padding: 5,
            },
        },
    ],
    placement: 'bottom',
};

export default function PopupHighlightError({ shape }: Props): JSX.Element {
    const { height, width, x, y } = shape;

    const reference = {
        getBoundingClientRect: () => ({
            bottom: y + height,
            height,
            left: x,
            right: x + width,
            top: y,
            width,
        }),
    };

    return (
        <PopupBase className="ba-PopupHighlightError" options={options} reference={reference}>
            <FormattedMessage {...messages.popupHighlightRestrictedPrompt} />
        </PopupBase>
    );
}
