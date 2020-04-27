import React from 'react';
import Button from 'box-ui-elements/es/components/button';
import PrimaryButton from 'box-ui-elements/es/components/primary-button';
import { KEYS } from 'box-ui-elements/es/constants';
import { Editor, EditorState, ContentState } from 'draft-js';
import { FormattedMessage, useIntl } from 'react-intl';
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
    const editorRef = React.useRef<Editor>(null);
    const contentState = ContentState.createFromText(value);
    const prevEditorState = EditorState.createWithContent(contentState);
    const [editorState, setEditorState] = React.useState<EditorState>(prevEditorState);
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
    const handleChange = (nextEditorState: EditorState): void => {
        setEditorState(nextEditorState);
        onChange(nextEditorState.getCurrentContent().getPlainText());
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
        const { current: editor } = editorRef;
        if (editor) {
            editor.focus();
            setEditorState(EditorState.moveFocusToEnd(editorState));
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
                        onClick={handleEvent}
                        placeholder={intl.formatMessage(messages.fieldPlaceholder)}
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
