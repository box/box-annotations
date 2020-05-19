import Button from 'box-ui-elements/es/components/button';
import { getFormattedCommentText } from 'box-ui-elements/es/components/form-elements/draft-js-mention-selector';
import PrimaryButton from 'box-ui-elements/es/components/primary-button';
import { EditorState } from 'draft-js';
import { Form, FormikProps } from 'formik';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from '../Popups/messages';
import ReplyField from '../ReplyField';
import { ContainerProps, FormValues } from './types';

type Props = ContainerProps & FormikProps<FormValues>;

const ReplyForm = ({ errors, isPending, onCancel, onChange, setFieldValue, values }: Props): JSX.Element => {
    const intl = useIntl();
    const hasErrors = Object.keys(errors).length > 0;
    const handleChange = (editorState: EditorState): void => {
        onChange(getFormattedCommentText(editorState).text);
        setFieldValue('editorState', editorState);
    };

    return (
        <Form className="ba-Popup-form" data-testid="ba-Popup-form">
            <div className="ba-Popup-main">
                <ReplyField
                    className="ba-Popup-field"
                    data-testid="ba-Popup-field"
                    editorState={values.editorState}
                    isDisabled={isPending}
                    onChange={handleChange}
                    placeholder={intl.formatMessage(messages.fieldPlaceholder)}
                />
            </div>
            <div className="ba-Popup-footer">
                <Button data-testid="ba-Popup-cancel" isDisabled={isPending} onClick={onCancel} type="button">
                    <FormattedMessage {...messages.buttonCancel} />
                </Button>
                <PrimaryButton data-testid="ba-Popup-submit" isDisabled={hasErrors || isPending} type="submit">
                    <FormattedMessage {...messages.buttonPost} />
                </PrimaryButton>
            </div>
        </Form>
    );
};

export default ReplyForm;
