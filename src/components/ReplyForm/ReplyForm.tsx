import React from 'react';
import { getFormattedCommentText } from 'box-ui-elements/es/components/form-elements/draft-js-mention-selector/utils';
import { KEYS } from 'box-ui-elements/es/constants';
import { EditorState } from 'draft-js';
import { Form, FormikProps } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from '../Popups/messages';
import ReplyButton from './ReplyButton';
import ReplyField from '../ReplyField';
import { FormValues, PropsFromState as ContainerProps } from './ReplyFormContainer';
import './ReplyForm.scss';

export type ReplyFormProps = {
    isPending: boolean;
    onCancel: (text: string) => void;
    onChange: (text: string) => void;
    onSubmit: (text: string) => void;
    value?: string;
};

export type Props = ReplyFormProps &
    ContainerProps &
    Pick<FormikProps<FormValues>, 'errors' | 'setFieldValue' | 'values'>;

const ReplyForm = (props: Props): JSX.Element => {
    const { errors, fileId, isCurrentFileVersion, isPending, onCancel, onChange, setFieldValue, values } = props;

    const formRef = React.useRef<HTMLFormElement>(null);
    const intl = useIntl();
    const hasErrors = Object.keys(errors).length > 0;
    const { editorState } = values;

    const handleCancel = (): void => {
        onCancel(getFormattedCommentText(editorState).text);
    };
    // Instead of deferring to the Formik handleChange helper, we need to use the setFieldValue helper
    // method in order for DraftJS to work correctly by setting back the whole editorState
    const handleChange = (nextEditorState: EditorState): void => {
        onChange(getFormattedCommentText(nextEditorState).text);
        setFieldValue('editorState', nextEditorState);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== KEYS.escape) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        handleCancel();
    };

    // The entire annotation mode keydown event listener is attached to real dom's document
    // Have to attach this event listener to real dom too, in order to capture the keydown event
    // before annotation mode event listner captures it
    React.useEffect(() => {
        const { current: formEl } = formRef;

        if (formEl) {
            // Add event listener to real DOM
            formEl.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (formEl) {
                formEl.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [formRef]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Form ref={formRef} className="ba-ReplyForm" data-testid="ba-ReplyForm">
            <div className="ba-Popup-main">
                <ReplyField
                    className="ba-Popup-field"
                    data-testid="ba-Popup-field"
                    editorState={editorState}
                    isDisabled={isPending}
                    onChange={handleChange}
                    placeholder={intl.formatMessage(messages.fieldPlaceholder)}
                />
            </div>
            <div className="ba-Popup-footer">
                <ReplyButton
                    data-resin-fileId={fileId}
                    data-resin-isCurrent={isCurrentFileVersion}
                    data-resin-target="cancel"
                    data-testid="ba-Popup-cancel"
                    isDisabled={isPending}
                    onClick={handleCancel}
                    type="button"
                >
                    <FormattedMessage {...messages.buttonCancel} />
                </ReplyButton>
                <ReplyButton
                    data-resin-fileId={fileId}
                    data-resin-isCurrent={isCurrentFileVersion}
                    data-resin-target="post"
                    data-testid="ba-Popup-submit"
                    isDisabled={hasErrors || isPending}
                    isPrimary
                    type="submit"
                >
                    <FormattedMessage {...messages.buttonPost} />
                </ReplyButton>
            </div>
        </Form>
    );
};

export default ReplyForm;
