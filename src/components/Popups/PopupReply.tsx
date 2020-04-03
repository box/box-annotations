import React from 'react';
import Button from 'box-ui-elements/es/components/button';
import PrimaryButton from 'box-ui-elements/es/components/primary-button';
import { KEYS } from 'box-ui-elements/es/constants';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import PopupBase from './PopupBase';
import './PopupReply.scss';

export type Props = {
    className?: string;
    onCancel: (text?: string) => void;
    onChange: (text?: string) => void;
    onSubmit: (text: string) => void;
    reference: HTMLElement;
};

export default function PopupReply({ onCancel, onChange, onSubmit, ...rest }: Props): JSX.Element {
    const [text, setText] = React.useState('');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Event Handlers
    const handleEvent = (event: React.SyntheticEvent): void => {
        event.preventDefault();
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
    const handleCreate = (event: React.MouseEvent): void => {
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
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    return (
        <PopupBase options={{ onFirstUpdate: handleFirstUpdate }} {...rest}>
            <div className="ba-Popup-main">
                <textarea
                    ref={textareaRef}
                    className="ba-Popup-text"
                    data-testid="ba-Popup-text"
                    onChange={handleChange}
                    onClick={handleEvent}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <div className="ba-Popup-footer">
                <Button data-testid="ba-Popup-cancel" onClick={handleCancel} type="button">
                    <FormattedMessage {...messages.buttonCancel} />
                </Button>
                <PrimaryButton data-testid="ba-Popup-submit" onClick={handleCreate} type="submit">
                    <FormattedMessage {...messages.buttonPost} />
                </PrimaryButton>
            </div>
        </PopupBase>
    );
}
