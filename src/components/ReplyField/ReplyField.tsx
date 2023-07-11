import * as React from 'react';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import {
    addMention,
    getActiveMentionForEditorState,
} from 'box-ui-elements/es/components/form-elements/draft-js-mention-selector/utils';
import { DraftHandleValue, Editor, EditorState } from 'draft-js';
import PopupList from '../Popups/PopupList';
import { Collaborator } from '../../@types';
import { VirtualElement } from '../Popups/Popper';
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
    collaborators: Collaborator[];
    cursorPosition: number;
    editorState: EditorState;
    fetchCollaborators: (searchString: string) => void;
    isDisabled?: boolean;
    onChange: (editorState: EditorState) => void;
    placeholder?: string;
    setCursorPosition: (cursorPosition: number) => void;
};

export type State = {
    activeItemIndex: number;
    popupAutoScroll: boolean;
    popupReference: VirtualElement | null;
};

export const DEFAULT_COLLAB_DEBOUNCE = 500;

export default class ReplyField extends React.Component<Props, State> {
    static defaultProps = {
        isDisabled: false,
    };

    state: State = { activeItemIndex: 0, popupAutoScroll: false, popupReference: null };

    fetchCollaborators = debounce((editorState: EditorState): void => {
        const { fetchCollaborators } = this.props;

        const activeMention = getActiveMentionForEditorState(editorState);
        const trimmedQuery = activeMention?.mentionString.trim();
        if (!trimmedQuery) {
            return;
        }

        fetchCollaborators(trimmedQuery);
    }, DEFAULT_COLLAB_DEBOUNCE);

    handleResize = debounce(() => this.updatePopupReference(), 100);

    componentDidMount(): void {
        // The browser’s native zoom doesn’t always trigger Preview’s resize
        window.addEventListener('resize', this.handleResize);
    }

    componentDidUpdate({ editorState: prevEditorState }: Props): void {
        const { editorState } = this.props;

        if (prevEditorState !== editorState) {
            this.updatePopupReference();
        }
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.handleResize);
        this.saveCursorPosition();
    }

    getVirtualElement = (activeMention: Mention): VirtualElement | null => {
        const selection = window.getSelection();
        if (!selection?.focusNode) {
            return null;
        }

        const range = selection.getRangeAt(0);
        const textNode = range.endContainer;
        const currentCursor = range.endOffset;

        const { mentionString, mentionTrigger } = activeMention;
        const offset = mentionString.length + mentionTrigger.length;
        const mentionStart = Math.max(0, currentCursor - offset);

        range.setStart(textNode, mentionStart);
        range.setEnd(textNode, mentionStart);

        const mentionRect = range.getBoundingClientRect();

        // restore cursor position
        range.setStart(textNode, currentCursor);
        range.setEnd(textNode, currentCursor);

        return {
            getBoundingClientRect: () => mentionRect,
        };
    };

    updatePopupReference = (): void => {
        const { editorState } = this.props;

        const activeMention = getActiveMentionForEditorState(editorState);

        this.setState({ popupReference: activeMention ? this.getVirtualElement(activeMention) : null });
    };

    saveCursorPosition = (): void => {
        const { editorState, setCursorPosition } = this.props;

        setCursorPosition(editorState.getSelection().getFocusOffset());
    };

    stopDefaultEvent = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        event.stopPropagation();
    };

    setPopupListActiveItem = (index: number, autoScroll = false): void =>
        this.setState({ activeItemIndex: index, popupAutoScroll: autoScroll });

    handleChange = (nextEditorState: EditorState): void => {
        const { onChange } = this.props;

        this.fetchCollaborators(nextEditorState);
        onChange(nextEditorState);
    };

    handleSelect = (index: number): void => {
        const { collaborators, editorState } = this.props;

        const activeMention = getActiveMentionForEditorState(editorState);
        const editorStateWithLink = addMention(editorState, activeMention, collaborators[index]);

        this.handleChange(editorStateWithLink);
        this.setPopupListActiveItem(0);
    };

    handleReturn = (event: React.KeyboardEvent): DraftHandleValue => {
        const { activeItemIndex, popupReference } = this.state;

        if (!popupReference) {
            return 'not-handled';
        }

        this.stopDefaultEvent(event);
        this.handleSelect(activeItemIndex);

        return 'handled';
    };

    handleArrow = (event: React.KeyboardEvent): number => {
        const { collaborators } = this.props;
        const { popupReference } = this.state;
        const { length } = collaborators;

        if (!popupReference || !length) {
            return 0;
        }

        this.stopDefaultEvent(event);

        return length;
    };

    handleUpArrow = (event: React.KeyboardEvent): void => {
        const { activeItemIndex } = this.state;
        const length = this.handleArrow(event);

        if (!length) {
            return;
        }

        this.setPopupListActiveItem(activeItemIndex === 0 ? length - 1 : activeItemIndex - 1, true);
    };

    handleDownArrow = (event: React.KeyboardEvent): void => {
        const { activeItemIndex } = this.state;
        const length = this.handleArrow(event);

        if (!length) {
            return;
        }

        this.setPopupListActiveItem(activeItemIndex === length - 1 ? 0 : activeItemIndex + 1, true);
    };

    handleMouseDown = (event: React.SyntheticEvent): void => event.preventDefault(); // prevent the blur event so that Editor can remain focus

    render(): JSX.Element {
        const { className, collaborators, editorState, isDisabled, placeholder, ...rest } = this.props;
        const { activeItemIndex, popupAutoScroll, popupReference } = this.state;

        return (
            <div className={classnames(className, 'ba-ReplyField')}>
                <Editor
                    {...rest}
                    ariaMultiline
                    editorState={editorState}
                    handleReturn={this.handleReturn}
                    onChange={this.handleChange}
                    onDownArrow={this.handleDownArrow}
                    onUpArrow={this.handleUpArrow}
                    placeholder={placeholder}
                    readOnly={isDisabled}
                    stripPastedStyles
                    webDriverTestID="ba-ReplyField-editor"
                />

                {popupReference && (
                    <PopupList
                        activeItemIndex={activeItemIndex}
                        autoScroll={popupAutoScroll}
                        items={collaborators}
                        onActivate={this.setPopupListActiveItem}
                        onMouseDown={this.handleMouseDown}
                        onSelect={this.handleSelect}
                        reference={popupReference}
                    />
                )}
            </div>
        );
    }
}
