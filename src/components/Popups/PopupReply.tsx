import React from 'react';
import Popper from '@popperjs/core';
import ReactRedux from 'react-redux';
import { useIntl } from 'react-intl';
import FocusTrap from 'box-ui-elements/es/components/focus-trap/FocusTrap';
import messages from './messages';
import PopupBase from './PopupBase';
import ReplyForm from '../ReplyForm';
import { getScale, getRotation } from '../../store/options';
import { PopupReference } from './Popper';
import './PopupReply.scss';

export type Props = {
    className?: string;
    isPending: boolean;
    onCancel: (text?: string) => void;
    onChange: (text?: string) => void;
    onSubmit: (text: string) => void;
    reference: PopupReference;
    value?: string;
};

const isIE = (): boolean => {
    const { userAgent } = navigator;
    return userAgent.indexOf('Trident/') > 0;
};

export const options: Pick<Popper.Options, 'modifiers'> = {
    modifiers: [
        {
            name: 'arrow',
            options: {
                element: '.ba-Popup-arrow',
                padding: 10,
            },
        },
        {
            name: 'flip',
            options: {
                altAxis: false,
                fallbackPlacements: ['bottom', 'top', 'left', 'right'],
            },
        },
        {
            name: 'offset',
            options: {
                offset: [0, 15],
            },
        },
        {
            name: 'preventOverflow',
            options: {
                padding: 5,
            },
        },
    ],
};

const getOptions = (): Partial<Popper.Options> => {
    const { modifiers: defaultModifiers } = options;
    const placement = isIE() ? 'top' : 'bottom';
    const modifiers = isIE()
        ? [
              ...defaultModifiers,
              {
                  name: 'eventListeners',
                  options: {
                      scroll: false,
                  },
              },
          ]
        : defaultModifiers;

    return {
        modifiers,
        placement,
    };
};

export default function PopupReply({
    isPending,
    onCancel,
    onChange,
    onSubmit,
    value = '',
    ...rest
}: Props): JSX.Element {
    const intl = useIntl();
    const popupRef = React.useRef<PopupBase>(null);
    const popupOptions = React.useRef<Partial<Popper.Options>>(getOptions()); // Keep the options reference the same between renders
    const rotation = ReactRedux.useSelector(getRotation);
    const scale = ReactRedux.useSelector(getScale);

    React.useEffect(() => {
        const { current: popup } = popupRef;

        if (popup?.popper) {
            popup.popper.update();
        }
    }, [popupRef, rotation, scale]);

    return (
        <FocusTrap>
            <PopupBase
                ref={popupRef}
                aria-label={intl.formatMessage(messages.ariaLabelComment)}
                data-resin-component="popupReply"
                options={popupOptions.current}
                role="dialog"
                {...rest}
            >
                <ReplyForm
                    isPending={isPending}
                    onCancel={onCancel}
                    onChange={onChange}
                    onSubmit={onSubmit}
                    value={value}
                />
            </PopupBase>
        </FocusTrap>
    );
}
