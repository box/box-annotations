import * as React from 'react';
import * as Popper from '@popperjs/core';
import * as ReactRedux from 'react-redux';
import PopupBase from './PopupBase';
import ReplyForm from '../ReplyForm';
import usePrevious from '../../common/usePrevious';
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
    const popupRef = React.useRef<PopupBase>(null);
    const popupOptions = React.useRef<Partial<Popper.Options>>(getOptions()); // Keep the options reference the same between renders
    const rotation = ReactRedux.useSelector(getRotation);
    const prevRotation = usePrevious(rotation);
    const scale = ReactRedux.useSelector(getScale);
    const prevScale = usePrevious(scale);

    React.useEffect(() => {
        const { current: popup } = popupRef;

        if (popup?.popper && (rotation !== prevRotation || scale !== prevScale)) {
            popup.popper.update();
        }
    }, [popupRef, prevRotation, prevScale, rotation, scale]);

    return (
        <PopupBase ref={popupRef} data-resin-component="popupReply" options={popupOptions.current} {...rest}>
            <ReplyForm
                isPending={isPending}
                onCancel={onCancel}
                onChange={onChange}
                onSubmit={onSubmit}
                value={value}
            />
        </PopupBase>
    );
}
