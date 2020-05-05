import * as React from 'react';
import classnames from 'classnames';
import { Editor, EditorState, ContentState, SelectionState } from 'draft-js';

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
    editorRef: React.MutableRefObject<Editor | null> = React.createRef<Editor | null>();

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
    }

    componentDidMount(): void {
        this.focusEditor();
    }

    componentWillUnmount(): void {
        this.saveCursorPosition();
    }

    focusEditor = (): void => {
        const { current: editor } = this.editorRef;
        if (editor) {
            editor.focus();
        }
    };

    saveCursorPosition = (): void => {
        const { setCursorPosition } = this.props;
        const { editorState } = this.state;

        setCursorPosition(editorState.getSelection().getFocusOffset());
    };

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
                    ref={this.editorRef}
                    editorState={editorState}
                    onChange={this.handleChange}
                    placeholder={placeholder}
                    readOnly={isDisabled}
                    stripPastedStyles
                    webDriverTestID="ba-ReplyField-editor"
                />
            </div>
        );
    }
}
