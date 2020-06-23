import * as React from 'react';
import * as Popper from '@popperjs/core';
import * as ReactRedux from 'react-redux';
import * as ReactPopper from 'react-popper';
import PopupBase from './PopupBase';
import ReplyForm from '../ReplyForm';
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
    reference,
    value = '',
    ...rest
}: Props): JSX.Element {
    // Store-based state
    const rotation = ReactRedux.useSelector(getRotation);
    const prevRotation = usePrevious(rotation);
    const scale = ReactRedux.useSelector(getScale);
    const prevScale = usePrevious(scale);

    // Popper-related state
    const [popupElement, setPopupElement] = React.useState<HTMLDivElement | null>(null);
    const { attributes, update, styles } = ReactPopper.usePopper(reference, popupElement, options);

    React.useEffect(() => {
        if (update && (scale !== prevScale || rotation !== prevRotation)) {
            update();
        }
    }, [rotation, scale, update]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <PopupBase ref={setPopupElement} attributes={attributes} styles={styles} {...rest}>
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
