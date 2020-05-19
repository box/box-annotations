import {
    createMentionSelectorState,
    getFormattedCommentText,
} from 'box-ui-elements/es/components/form-elements/draft-js-mention-selector';
import { EditorState, SelectionState } from 'draft-js';
import { FormikBag, withFormik } from 'formik';
import { connect } from 'react-redux';
import ReplyForm from './ReplyForm';
import withMentionDecorator from '../ReplyField/withMentionDecorator';
import { AppState, getCreatorCursor } from '../../store';
import { ContainerProps, FormErrors, FormValues, PropsFromState } from './types';

const MAX_LENGTH = 10000;

export const mapStateToProps = (state: AppState): PropsFromState => ({
    cursorPosition: getCreatorCursor(state),
});

export const mapPropsToValues = ({ cursorPosition: prevCursorPosition, value = '' }: ContainerProps): FormValues => {
    const mentionState = withMentionDecorator(createMentionSelectorState(value));
    const cursorPosition = value ? prevCursorPosition : 0;

    return {
        editorState: EditorState.forceSelection(
            mentionState,
            mentionState.getSelection().merge({
                anchorOffset: cursorPosition,
                focusOffset: cursorPosition,
                hasFocus: true,
            }) as SelectionState,
        ),
    };
};

export const validate = ({ editorState }: FormValues): FormErrors => {
    const errors: FormErrors = {};

    if (editorState) {
        const { text } = getFormattedCommentText(editorState);
        if (!text || text.trim().length === 0) {
            errors.editorState = 'required';
        } else if (text.length > MAX_LENGTH) {
            errors.editorState = 'maxlength';
        }
    }

    return errors;
};

export const handleSubmit = (
    { editorState }: FormValues,
    { props: { onSubmit } }: FormikBag<ContainerProps, FormValues>,
): void => onSubmit(getFormattedCommentText(editorState).text);

const ReplyFormContainer = connect(mapStateToProps)(
    withFormik<ContainerProps, FormValues>({
        handleSubmit,
        mapPropsToValues,
        validate,
    })(ReplyForm),
);

export default ReplyFormContainer;
