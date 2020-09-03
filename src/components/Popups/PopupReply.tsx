import * as React from 'react';
import * as Popper from '@popperjs/core';
import * as ReactRedux from 'react-redux';
import PopupBase from './PopupBase';
import ReplyForm from '../ReplyForm';
import usePreventEventPropagationRef from '../../common/usePreventEventPropagationRef';
import usePrevious from '../../common/usePrevious';
import { getScale, getRotation } from '../../store/options';
import './PopupReply.scss';

export type Props = {
    className?: string;
    isPending: boolean;
    onCancel: (text?: string) => void;
    onChange: (text?: string) => void;
    onSubmit: (text: string) => void;
    reference: Element;
    value?: string;
};

export const options: Partial<Popper.Options> = {
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

export default function PopupReply({
    isPending,
    onCancel,
    onChange,
    onSubmit,
    value = '',
    ...rest
}: Props): JSX.Element {
    const popupRef = React.useRef<PopupBase>(null);
    const rotation = ReactRedux.useSelector(getRotation);
    const prevRotation = usePrevious(rotation);
    const scale = ReactRedux.useSelector(getScale);
    const prevScale = usePrevious(scale);

    // Prevent mousedown and mouseup events that occur within the ReplyForm from propagating the HighlightListener.
    const divRef = usePreventEventPropagationRef<HTMLDivElement>('mousedown', 'mouseup');

    React.useEffect(() => {
        const { current: popup } = popupRef;

        if (popup?.popper && (rotation !== prevRotation || scale !== prevScale)) {
            popup.popper.update();
        }
    }, [popupRef, rotation, scale]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div ref={divRef} className="ba-PopupReply">
            <PopupBase ref={popupRef} data-resin-component="popupReply" options={options} {...rest}>
                <ReplyForm
                    isPending={isPending}
                    onCancel={onCancel}
                    onChange={onChange}
                    onSubmit={onSubmit}
                    value={value}
                />
            </PopupBase>
        </div>
    );
}
