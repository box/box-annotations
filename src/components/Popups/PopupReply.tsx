import React from 'react';
import Button from 'box-ui-elements/es/components/button';
import PrimaryButton from 'box-ui-elements/es/components/primary-button';
import { KEYS } from 'box-ui-elements/es/constants';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from './messages';
import PopupBase from './PopupBase';
import ReplyField from './ReplyField';

export type Props = {
    className?: string;
    isPending: boolean;
    onCancel: (text?: string) => void;
    onChange: (text?: string) => void;
    onSubmit: (text: string) => void;
    reference: HTMLElement;
    value?: string;
};

export const options = {
    modifiers: [
        {
            name: 'arrow',
            options: {
                element: '.ba-Popup-arrow',
                padding: 20,
            },
        },
        {
            name: 'flip',
            options: {
                altAxis: false,
                fallbackPlacements: ['bottom', 'top', 'left', 'right'],
                padding: 5,
            },
        },
        {
            name: 'offset',
            options: {
                offset: [0, 15],
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
    const isEmpty = value.length === 0;
    const intl = useIntl();

    // Event Handlers
    const handleEvent = (event: React.SyntheticEvent): void => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };
    const handleCancel = (event: React.MouseEvent): void => {
        handleEvent(event);
        onCancel(value);
    };
    const handleChange = (text?: string): void => {
        onChange(text);
    };
    const handleSubmit = (event: React.FormEvent): void => {
        event.preventDefault();
        handleEvent(event);
        onSubmit(value);
    };
    const handleKeyDown = (event: React.KeyboardEvent): void => {
        if (event.key !== KEYS.escape) {
            return;
        }

        handleEvent(event);
        onCancel(value);
    };

    return (
        <PopupBase onKeyDown={handleKeyDown} options={options} {...rest}>
            <form className="ba-Popup-form" data-testid="ba-Popup-form" onSubmit={handleSubmit}>
                <div className="ba-Popup-main">
                    <ReplyField
                        className="ba-Popup-field"
                        data-testid="ba-Popup-field"
                        isDisabled={isPending}
                        onChange={handleChange}
                        onClick={handleEvent}
                        placeholder={intl.formatMessage(messages.fieldPlaceholder)}
                        value={value}
                    />
                </div>
                <div className="ba-Popup-footer">
                    <Button data-testid="ba-Popup-cancel" isDisabled={isPending} onClick={handleCancel} type="button">
                        <FormattedMessage {...messages.buttonCancel} />
                    </Button>
                    <PrimaryButton data-testid="ba-Popup-submit" isDisabled={isEmpty || isPending} type="submit">
                        <FormattedMessage {...messages.buttonPost} />
                    </PrimaryButton>
                </div>
            </form>
        </PopupBase>
    );
}
