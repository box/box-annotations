import React from 'react';
import Button from 'box-ui-elements/es/components/button';
import PrimaryButton from 'box-ui-elements/es/components/primary-button';
import { KEYS } from 'box-ui-elements/es/constants';
import { Editor, EditorState } from 'draft-js';
import { FormattedMessage, IntlShape } from 'react-intl';
import messages from './messages';
import PopupBase from './PopupBase';
import ReplyField from './ReplyField';
import './PopupReply.scss';

export type Props = {
    className?: string;
    editorState: EditorState;
    intl: IntlShape;
    isPending: boolean;
    onCancel: () => void;
    onChange: (nextEditorState: EditorState) => void;
    onSubmit: () => void;
    reference: HTMLElement;
};

export default function PopupReply({
    editorState,
    intl,
    isPending,
    onCancel,
    onChange,
    onSubmit,
    ...rest
}: Props): JSX.Element {
    const editorRef = React.useRef<Editor>(null);

    // Event Handlers
    const handleEvent = (event: React.SyntheticEvent): void => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };
    const handleCancel = (event: React.MouseEvent): void => {
        handleEvent(event);
        onCancel();
    };
    const handleChange = (nextEditorState: EditorState): void => {
        onChange(nextEditorState);
    };
    const handleSubmit = (event: React.FormEvent): void => {
        event.preventDefault();
        handleEvent(event);
        onSubmit();
    };
    const handleKeyDown = (event: React.KeyboardEvent): void => {
        if (event.key !== KEYS.escape) {
            return;
        }

        handleEvent(event);
        onCancel();
    };
    const handleFirstUpdate = (): void => {
        const { current: editor } = editorRef;
        if (editor) {
            editor.focus();
        }
    };

    return (
        <PopupBase onKeyDown={handleKeyDown} options={{ onFirstUpdate: handleFirstUpdate }} {...rest}>
            <form className="ba-Popup-form" data-testid="ba-Popup-form" onSubmit={handleSubmit}>
                <div className="ba-Popup-main">
                    <ReplyField
                        ref={editorRef}
                        className="ba-Popup-field"
                        data-testid="ba-Popup-field"
                        editorState={editorState}
                        isDisabled={isPending}
                        onChange={handleChange}
                        placeholder={intl.formatMessage(messages.fieldPlaceholder)}
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
