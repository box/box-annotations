import React from 'react';
import Button from 'box-ui-elements/es/components/button';
import PrimaryButton from 'box-ui-elements/es/components/primary-button';
import { KEYS } from 'box-ui-elements/es/constants';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import PopupBase from './PopupBase';
import ReplyField from './ReplyField';
import './PopupReply.scss';

export type Props = {
    className?: string;
    isPending: boolean;
    onCancel: (text?: string) => void;
    onChange: (text?: string) => void;
    onSubmit: (text: string) => void;
    reference: HTMLElement;
    value?: string;
};

export default function PopupReply({
    isPending,
    onCancel,
    onChange,
    onSubmit,
    value = '',
    ...rest
}: Props): JSX.Element {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Event Handlers
    const handleEvent = (event: React.SyntheticEvent): void => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };
    const handleCancel = (event: React.MouseEvent): void => {
        handleEvent(event);
        onCancel(value);
    };
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        onChange(event.target.value);
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
    const handleFirstUpdate = (): void => {
        const { current: textarea } = textareaRef;

        if (textarea) {
            textarea.focus();
            textarea.selectionStart = value.length; // Force cursor to the end after focus
            textarea.selectionEnd = value.length; // Force cursor to the end after focus
        }
    };

    return (
        <PopupBase onKeyDown={handleKeyDown} options={{ onFirstUpdate: handleFirstUpdate }} {...rest}>
            <form className="ba-Popup-form" data-testid="ba-Popup-form" onSubmit={handleSubmit}>
                <div className="ba-Popup-main">
                    <ReplyField
                        ref={textareaRef}
                        className="ba-Popup-text"
                        data-testid="ba-Popup-text"
                        disabled={isPending}
                        onChange={handleChange}
                        onClick={handleEvent}
                        value={value}
                    />
                </div>
                <div className="ba-Popup-footer">
                    <Button data-testid="ba-Popup-cancel" isDisabled={isPending} onClick={handleCancel} type="button">
                        <FormattedMessage {...messages.buttonCancel} />
                    </Button>
                    <PrimaryButton data-testid="ba-Popup-submit" isDisabled={isPending} type="submit">
                        <FormattedMessage {...messages.buttonPost} />
                    </PrimaryButton>
                </div>
            </form>
        </PopupBase>
    );
}
