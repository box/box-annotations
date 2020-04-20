import React from 'react';
import { KEYS } from 'box-ui-elements/es/constants';
import ReplyForm from '../ReplyForm';
import PopupBase from './PopupBase';

export type Props = {
    className?: string;
    defaultValue?: string;
    onCancel: (text: string) => void;
    onChange: (text: string) => void;
    onSubmit: (text: string) => void;
    reference: HTMLElement;
};

export default function PopupReply({ onCancel, onChange, onSubmit, ...rest }: Props): JSX.Element {
    let text = '';
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Event Handlers
    const handleEvent = (event: React.SyntheticEvent): void => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };

    const handleKeyDown = (event: React.KeyboardEvent): void => {
        if (event.key !== KEYS.escape) {
            return;
        }

        handleEvent(event);
        onCancel(text);
    };

    const handleChange = (newText: string): void => {
        text = newText;
        onChange(text);
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
            <ReplyForm
                onCancel={onCancel}
                onChange={handleChange}
                onSubmit={onSubmit}
                textareaRef={textareaRef}
                {...rest}
            />
        </PopupBase>
    );
}
