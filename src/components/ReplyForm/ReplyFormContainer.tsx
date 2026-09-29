import createMentionTimestampSelectorState from 'box-ui-elements/es/components/form-elements/draft-js-mention-selector/createMentionTimestampSelectorState';
import { getFormattedCommentText } from 'box-ui-elements/es/components/form-elements/draft-js-mention-selector/utils';
import { EditorState, SelectionState } from 'draft-js';
import { FormikBag, withFormik } from 'formik';
import { connect } from 'react-redux';
import ReplyForm, { ReplyFormProps } from './ReplyForm';
import withMentionDecorator from '../ReplyField/withMentionDecorator';
import { AppState, getCreatorCursor } from '../../store';

export type PropsFromState = {
    cursorPosition: number;
};

type Props = ReplyFormProps & PropsFromState;

export type FormErrors = {
    [V in keyof FormValues]?: string;
};

export type FormValues = {
    editorState: EditorState;
};

const MAX_LENGTH = 10000;

export const mapStateToProps = (state: AppState): PropsFromState => ({
    cursorPosition: getCreatorCursor(state),
});

export const mapPropsToErrors = (): FormErrors => ({ editorState: 'initial' });

export const mapPropsToValues = ({ cursorPosition: prevCursorPosition, value = '' }: Props): FormValues => {
    const mentionState = withMentionDecorator(createMentionTimestampSelectorState(value));
    const selection = mentionState.getSelection();
    const blockLength = mentionState.getCurrentContent().getBlockForKey(selection.getAnchorKey()).getLength();
    // The saved message is trimmed, so the saved cursor can sit past the end of the rebuilt text
    const cursorPosition = value ? Math.min(prevCursorPosition, blockLength) : 0;

    return {
        editorState: EditorState.forceSelection(
            mentionState,
            selection.merge({
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
    { props: { onSubmit } }: Pick<FormikBag<Props, FormValues>, 'props'>,
): void => onSubmit(getFormattedCommentText(editorState).text);

const ReplyFormContainer = connect(mapStateToProps)(
    withFormik<Props, FormValues>({
        handleSubmit,
        mapPropsToErrors,
        mapPropsToValues,
        validate,
        validateOnMount: true,
    })(ReplyForm),
);

export default ReplyFormContainer;
