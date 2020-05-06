import * as React from 'react';
import classnames from 'classnames';
import { getActiveMentionForEditorState } from 'box-ui-elements/es/components/form-elements/draft-js-mention-selector';
import { ContentState, Editor, EditorState, SelectionState } from 'draft-js';
import PopupList from './PopupList';
import { VirtualElement } from '../Popper';
import './ReplyField.scss';

export type Mention = {
    blockID: string;
    end: number;
    mentionString: string;
    mentionTrigger: string;
    start: number;
};

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
    popupReference: VirtualElement | null;
};

export default class ReplyField extends React.Component<Props, State> {
    static defaultProps = {
        isDisabled: false,
        value: '',
    };

    editorRef: React.MutableRefObject<Editor | null> = React.createRef<Editor | null>();

    constructor(props: Props) {
        super(props);

        const { value, cursorPosition } = props;
        const contentState = ContentState.createFromText(value as string);
        let prevEditorState = EditorState.createWithContent(contentState);
        let selectionState = prevEditorState.getSelection();

        selectionState = selectionState.merge({
            anchorOffset: cursorPosition,
            focusOffset: cursorPosition,
        }) as SelectionState;
        prevEditorState = EditorState.forceSelection(prevEditorState, selectionState);

        this.state = {
            editorState: prevEditorState,
            popupReference: null,
        };
    }

    componentDidMount(): void {
        this.focusEditor();
    }

    componentWillUnmount(): void {
        this.saveCursorPosition();
    }

    getVirtualElement = (activeMention: Mention): VirtualElement | null => {
        const selection = window.getSelection();
        if (!selection?.focusNode) {
            return null;
        }

        const range = selection.getRangeAt(0);
        const textNode = range.endContainer;

        range.setStart(textNode, activeMention.start);
        range.setEnd(textNode, activeMention.start);

        const mentionRect = range.getBoundingClientRect();

        // restore selection
        range.setStart(textNode, activeMention.end);
        range.setEnd(textNode, activeMention.end);

        return {
            getBoundingClientRect: () => mentionRect,
        };
    };

    handleChange = (nextEditorState: EditorState): void => {
        const { onChange, onMention } = this.props;

        onChange(nextEditorState.getCurrentContent().getPlainText());

        const activeMention = getActiveMentionForEditorState(nextEditorState);

        if (onMention && activeMention) {
            onMention(activeMention.mentionString);
        }

        this.setState({ editorState: nextEditorState }, () => {
            // In order to get correct selection, getVirtualElement has to be called after new texts are rendered
            const popupReference = activeMention ? this.getVirtualElement(activeMention) : null;
            this.setState({ popupReference });
        });
    };

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

    render(): JSX.Element {
        const { className, isDisabled, placeholder, ...rest } = this.props;
        const { editorState, popupReference } = this.state;

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

                {popupReference && <PopupList reference={popupReference} />}
            </div>
        );
    }
}
