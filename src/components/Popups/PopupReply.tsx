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
    defaultValue?: string;
    onCancel: (text?: string) => void;
    onChange: (text?: string) => void;
    onSubmit: (text: string) => void;
    reference: HTMLElement;
};

export default function PopupReply({ defaultValue, onCancel, onChange, onSubmit, ...rest }: Props): JSX.Element {
    const [text, setText] = React.useState('');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Event Handlers
    const handleEvent = (event: React.SyntheticEvent): void => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };
    const handleCancel = (event: React.MouseEvent): void => {
        handleEvent(event);
        onCancel(text);
    };
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setText(event.target.value);
        onChange(event.target.value);
    };
    const handleSubmit = (event: React.FormEvent): void => {
        handleEvent(event);
        onSubmit(text);
    };
    const handleKeyDown = (event: React.KeyboardEvent): void => {
        if (event.key !== KEYS.escape) {
            return;
        }

        handleEvent(event);
        onCancel(text);
    };
    const handleFirstUpdate = (): void => {
        const { current: textarea } = textareaRef;

        if (textarea) {
            const { value } = textarea;

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
                        defaultValue={defaultValue}
                        onChange={handleChange}
                        onClick={handleEvent}
                    />
                </div>
                <div className="ba-Popup-footer">
                    <Button data-testid="ba-Popup-cancel" onClick={handleCancel} type="button">
                        <FormattedMessage {...messages.buttonCancel} />
                    </Button>
                    <PrimaryButton data-testid="ba-Popup-submit" type="submit">
                        <FormattedMessage {...messages.buttonPost} />
                    </PrimaryButton>
                </div>
            </form>
        </PopupBase>
    );
}
