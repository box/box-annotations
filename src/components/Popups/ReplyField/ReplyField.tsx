import React from 'react';
import classnames from 'classnames';
import { Editor, EditorState, ContentState, SelectionState } from 'draft-js';
import 'draft-js/dist/Draft.css';

import './ReplyField.scss';

export type Props = {
    className?: string;
    cursorPosition: number;
    isDisabled?: boolean;
    onChange: (text?: string) => void;
    onClick: (event: React.SyntheticEvent) => void;
    onMention?: (mention: string) => void;
    placeholder?: string;
    setCursorPosition: (cursorPosition: number) => void;
    value?: string;
};

export type State = {
    editorState: EditorState;
};

export default class ReplyField extends React.Component<Props, State> {
    private editor: React.RefObject<Editor>;

    constructor(props: Props) {
        super(props);

        const { value, cursorPosition } = props;
        const contentState = ContentState.createFromText(value || '');
        let prevEditorState = EditorState.createWithContent(contentState);
        let selectionState = prevEditorState.getSelection();

        selectionState = selectionState.merge({
            anchorOffset: cursorPosition,
            focusOffset: cursorPosition,
        }) as SelectionState;
        prevEditorState = EditorState.forceSelection(prevEditorState, selectionState);

        this.state = {
            editorState: prevEditorState,
        };

        this.editor = React.createRef();
    }

    componentDidMount(): void {
        const { current: editor } = this.editor;
        if (editor) {
            editor.focus();
        }
    }

    componentWillUnmount(): void {
        const { setCursorPosition } = this.props;
        const { editorState } = this.state;

        setCursorPosition(editorState.getSelection().getFocusOffset());
    }

    handleChange = (nextEditorState: EditorState): void => {
        const { onChange } = this.props;

        this.setState({ editorState: nextEditorState });
        onChange(nextEditorState.getCurrentContent().getPlainText());
    };

    render(): JSX.Element {
        const { className, isDisabled, placeholder, ...rest } = this.props;
        const { editorState } = this.state;

        return (
            <div className={classnames(className, 'ba-ReplyField')}>
                <Editor
                    {...rest}
                    ref={this.editor}
                    editorState={editorState}
                    onChange={this.handleChange}
                    placeholder={placeholder}
                    readOnly={isDisabled}
                    stripPastedStyles
                />
            </div>
        );
    }
}
