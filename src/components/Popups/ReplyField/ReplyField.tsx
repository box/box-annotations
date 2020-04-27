import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { Editor, EditorState, Modifier, SelectionState } from 'draft-js';
import 'draft-js/dist/Draft.css';

import PopupList from './PopupList';
import './ReplyField.scss';

export type Props = {
    className?: string;
    isDisabled?: boolean;
    editorState: EditorState;
    onChange: (editorState: EditorState) => void;
    onMention?: (mention: string) => void;
    placeholder?: string;
};

export type Range = {
    start: number;
    end: number;
    mentionString: string;
};

const ReplyField = (props: Props, ref: React.Ref<Editor>): JSX.Element => {
    const { className, editorState, isDisabled, onChange, placeholder, ...rest } = props;
    const [mentionRef, setMentionRef] = useState<HTMLElement>();
    const [activeMentionKey, setActiveMentionKey] = useState<string>();

    const triggerChars = ['@', '＠', '﹫'];

    const findMention = (nextEditorState: EditorState): void => {
        const contentState = nextEditorState.getCurrentContent();
        const selectionState = nextEditorState.getSelection();
        const startKey = selectionState.getStartKey();
        const activeBlock = contentState.getBlockForKey(startKey);
        const cursorPosition = selectionState.getStartOffset();

        // stop if it's first char
        if (!cursorPosition) {
            return;
        }

        const lastChar = activeBlock.getText().substr(cursorPosition - 1, 1);
        const isMention = triggerChars.includes(lastChar);

        if (!isMention) {
            return;
        }

        const mentionCharSelectionState = selectionState.merge({
            anchorOffset: cursorPosition - 1,
            focusOffset: cursorPosition,
        }) as SelectionState;

        const contentStateWithEntity = contentState.createEntity('PENDING_MENTION', 'MUTABLE');
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const contentStateWithStyle = Modifier.applyEntity(contentState, mentionCharSelectionState, entityKey);

        let editorStateWithStyle = EditorState.push(nextEditorState, contentStateWithStyle, 'apply-entity');
        editorStateWithStyle = EditorState.forceSelection(editorStateWithStyle, selectionState); // move cursor back

        setActiveMentionKey(entityKey);
        onChange(editorStateWithStyle);
    };

    const getActiveMentionRange = (nextEditorState: EditorState): Range | null => {
        const contentState = nextEditorState.getCurrentContent();
        const selectionState = nextEditorState.getSelection();
        const startKey = selectionState.getStartKey();
        const activeBlock = contentState.getBlockForKey(startKey);
        const cursorPosition = selectionState.getStartOffset();

        let range = null;
        let activeMentionPosition = 0;

        activeBlock.findEntityRanges(
            character => character.getEntity() === activeMentionKey,
            (start, end) => {
                activeMentionPosition = end;
            },
        );

        // not in the same block
        if (!activeMentionPosition) {
            return null;
        }

        activeBlock.findEntityRanges(
            character => character.getEntity() === null,
            (start, end) => {
                if (start <= cursorPosition && cursorPosition <= end) {
                    if (start === activeMentionPosition) {
                        range = {
                            start: start - 1,
                            end: cursorPosition,
                            mentionString: activeBlock.getText().substr(start, cursorPosition - start),
                        };
                    }
                }
            },
        );

        return range;
    };

    const applyStyleToRange = (nextEditorState: EditorState, range: Range): void => {
        const contentState = nextEditorState.getCurrentContent();
        const selectionState = nextEditorState.getSelection();

        const { start, end } = range;
        const rangeSelectionState = selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
        }) as SelectionState;

        const contentStateWithStyle = Modifier.applyEntity(
            contentState,
            rangeSelectionState,
            activeMentionKey as string,
        );

        let editorStateWithStyle = EditorState.push(nextEditorState, contentStateWithStyle, 'apply-entity');
        editorStateWithStyle = EditorState.forceSelection(editorStateWithStyle, selectionState);

        onChange(editorStateWithStyle);
    };

    const removeActiveMention = (nextEditorState: EditorState): void => {
        const contentState = nextEditorState.getCurrentContent();
        const curretSelection = nextEditorState.getSelection();
        let selectionToRemove = null;

        contentState.getBlocksAsArray().forEach(block => {
            block.findEntityRanges(
                character => character.getEntity() === activeMentionKey,
                (start, end) => {
                    selectionToRemove = SelectionState.createEmpty(block.getKey()).merge({
                        anchorOffset: start,
                        focusOffset: end,
                    }) as SelectionState;
                },
            );
        });

        if (!selectionToRemove) {
            return;
        }

        const contentStateWithoutMention = Modifier.applyEntity(contentState, selectionToRemove, null);

        let editorStateWithoutMention = EditorState.push(nextEditorState, contentStateWithoutMention, 'apply-entity');
        editorStateWithoutMention = EditorState.forceSelection(editorStateWithoutMention, curretSelection);

        setActiveMentionKey(undefined);
        onChange(editorStateWithoutMention);
    };

    const handleChange = (nextEditorState: EditorState): void => {
        onChange(nextEditorState);

        if (!activeMentionKey) {
            findMention(nextEditorState);
        } else {
            const range = getActiveMentionRange(nextEditorState);
            if (range) {
                // if cursor in range
                applyStyleToRange(nextEditorState, range);
                // search collaboraters
                // onMention(range.mentionString)
            } else {
                // if cursor out of range, remove active mention
                removeActiveMention(nextEditorState);
                // then find new possible mention
                findMention(nextEditorState);
            }
        }
    };

    useEffect(() => {
        setMentionRef(document.querySelector('#pending-mention') as HTMLElement);
    }, [editorState]);

    return (
        <div className={classnames(className, 'ba-ReplyField')}>
            <Editor
                ref={ref}
                editorState={editorState}
                onChange={handleChange}
                placeholder={placeholder}
                readOnly={isDisabled}
                stripPastedStyles
                {...rest}
            />

            {mentionRef && <PopupList reference={mentionRef} />}
        </div>
    );
};

export default React.forwardRef(ReplyField);
