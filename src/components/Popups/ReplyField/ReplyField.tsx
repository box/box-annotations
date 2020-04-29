import * as React from 'react';
import classnames from 'classnames';
import { VirtualElement } from '@popperjs/core';
import { Editor, EditorState, ContentState, SelectionState, getVisibleSelectionRect } from 'draft-js';
import PopupList from './PopupList';

import './ReplyField.scss';

const MENTION_TRIGGER_CHAR_WIDTH = 13;
const AVERAGE_CHAR_WIDTH = 8;

export type Mention = {
    blockID: string;
    mentionString: string;
    mentionTrigger: string;
    start: number;
    end: number;
};

export type Props = {
    className?: string;
    cursorPosition: number;
    isDisabled?: boolean;
    mentionTriggers?: string[];
    onChange: (text?: string) => void;
    onClick: (event: React.SyntheticEvent) => void;
    onMention?: (mention: string) => void;
    placeholder?: string;
    setCursorPosition: (cursorPosition: number) => void;
    value?: string;
};

export type State = {
    activeMention: Mention | null;
    editorState: EditorState;
    mentionPattern: RegExp;
    popupReference: VirtualElement | null;
    prevMentionPosition: number;
};

export default class ReplyField extends React.Component<Props, State> {
    static defaultProps = {
        className: '',
        isDisabled: false,
        mentionTriggers: ['@', '＠', '﹫'],
        value: '',
    };

    editorRef: React.MutableRefObject<Editor | null> = React.createRef<Editor | null>();

    constructor(props: Props) {
        super(props);
        const mentionTriggers = (props.mentionTriggers as string[]).reduce(
            (prev, current) => `${prev}\\${current}`,
            '',
        );

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
            activeMention: null,
            editorState: prevEditorState,
            mentionPattern: new RegExp(`([${mentionTriggers}])([^${mentionTriggers}]*)$`),
            prevMentionPosition: 0,
            popupReference: null,
        };
    }

    componentDidMount(): void {
        this.focusEditor();
    }

    componentWillUnmount(): void {
        this.saveCursorPosition();
    }

    getActiveMentionForEditorState(editorState: EditorState): Mention | null {
        const { mentionPattern } = this.state;

        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();

        const startKey = selectionState.getStartKey();
        const activeBlock = contentState.getBlockForKey(startKey);

        const cursorPosition = selectionState.getStartOffset();

        let result = null;

        // Break the active block into entity ranges.
        activeBlock.findEntityRanges(
            character => character.getEntity() === null,
            (start, end) => {
                // Find the active range (is the cursor inside this range?)
                if (start <= cursorPosition && cursorPosition <= end) {
                    // Determine if the active range contains a mention.
                    const activeRangeText = activeBlock.getText().substr(start, cursorPosition - start);
                    const mentionMatch = activeRangeText.match(mentionPattern);

                    if (mentionMatch) {
                        result = {
                            blockID: startKey,
                            mentionString: mentionMatch[2],
                            mentionTrigger: mentionMatch[1],
                            start: start + (mentionMatch.index as number),
                            end: cursorPosition,
                        };
                    }
                }

                return null;
            },
        );

        return result;
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

    handleMention = (): void => {
        const { onMention } = this.props;
        const { activeMention, prevMentionPosition } = this.state;

        if (onMention) {
            onMention(activeMention ? activeMention.mentionString : '');
        }

        const selectionRect = getVisibleSelectionRect(window);
        let virtualElement = null;
        let newMentionPosition = prevMentionPosition;
        if (selectionRect) {
            if (!prevMentionPosition) {
                const mentionStringLength = activeMention?.mentionString ? activeMention?.mentionString.length : 0;
                newMentionPosition =
                    selectionRect.right - MENTION_TRIGGER_CHAR_WIDTH - AVERAGE_CHAR_WIDTH * mentionStringLength;
            }
            selectionRect.right = newMentionPosition;
            selectionRect.left = newMentionPosition;

            virtualElement = {
                getBoundingClientRect: () => selectionRect,
            };
        } else {
            newMentionPosition = 0;
        }

        this.setState({
            popupReference: virtualElement,
            prevMentionPosition: newMentionPosition,
        });
    };

    hidePopup = (): void => {
        this.setState({
            popupReference: null,
            prevMentionPosition: 0,
        });
    };

    handleChange = (nextEditorState: EditorState): void => {
        const { onChange } = this.props;

        const activeMention = this.getActiveMentionForEditorState(nextEditorState);

        this.setState({ editorState: nextEditorState, activeMention }, () => {
            onChange(nextEditorState.getCurrentContent().getPlainText());

            if (activeMention) {
                this.handleMention();
            } else {
                this.hidePopup();
            }
        });
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
                />

                {popupReference && <PopupList reference={popupReference as HTMLElement} />}
            </div>
        );
    }
}
