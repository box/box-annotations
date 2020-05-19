import * as React from 'react';
import classnames from 'classnames';
import {
    addMention,
    getActiveMentionForEditorState,
} from 'box-ui-elements/es/components/form-elements/draft-js-mention-selector';
import fuzzySearch from 'box-ui-elements/es/utils/fuzzySearch';
import { ContentState, DraftHandleValue, Editor, EditorState, SelectionState } from 'draft-js';
import PopupList from './PopupList';
import withMentionDecorator from './withMentionDecorator';
import { Collaborator } from '../../../@types';
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
    collaborators: Collaborator[];
    cursorPosition: number;
    isDisabled?: boolean;
    itemRowAs?: JSX.Element;
    onChange: (text?: string) => void;
    onClick: (event: React.SyntheticEvent) => void;
    placeholder?: string;
    setCursorPosition: (cursorPosition: number) => void;
    value?: string;
};

export type State = {
    activeItemIndex: number;
    editorState: EditorState;
    popupReference: VirtualElement | null;
};

export default class ReplyField extends React.Component<Props, State> {
    static defaultProps = {
        isDisabled: false,
        value: '',
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            activeItemIndex: 0,
            editorState: this.restoreEditor(),
            popupReference: null,
        };
    }

    componentWillUnmount(): void {
        this.saveCursorPosition();
    }

    getCollaborators = (): Collaborator[] => {
        const { collaborators } = this.props;
        const { editorState } = this.state;

        const activeMention = getActiveMentionForEditorState(editorState);
        if (!activeMention) {
            return [];
        }

        const trimmedQuery = activeMention.mentionString.trim();
        // fuzzySearch doesn't match anything if query length is less than 2
        // Compared to empty list, full list has a better user experience
        if (trimmedQuery.length < 2) {
            return collaborators;
        }

        return collaborators.filter(({ item }) => {
            if (!item) {
                return false;
            }

            const isNameMatch = fuzzySearch(trimmedQuery, item.name, 0);
            const isEmailMatch = 'email' in item && fuzzySearch(trimmedQuery, item.email, 0);

            return isNameMatch || isEmailMatch;
        });
    };

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
        const mentionStart = currentCursor - offset;

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
        const { editorState } = this.state;

        const activeMention = getActiveMentionForEditorState(editorState);

        this.setState({ popupReference: activeMention ? this.getVirtualElement(activeMention) : null });
    };

    saveCursorPosition = (): void => {
        const { setCursorPosition } = this.props;
        const { editorState } = this.state;

        setCursorPosition(editorState.getSelection().getFocusOffset());
    };

    stopDefaultEvent = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        event.stopPropagation();
    };

    setPopupListActiveItem = (index: number): void => this.setState({ activeItemIndex: index });

    handleChange = (nextEditorState: EditorState): void => {
        const { onChange } = this.props;

        onChange(nextEditorState.getCurrentContent().getPlainText());

        // In order to get correct selection, getVirtualElement in this.updatePopupReference
        // has to be called after new texts are rendered in editor
        this.setState({ editorState: nextEditorState }, this.updatePopupReference);
    };

    handleSelect = (index: number): void => {
        const { editorState } = this.state;

        const activeMention = getActiveMentionForEditorState(editorState);
        const collaborators = this.getCollaborators();
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
        const { popupReference } = this.state;
        const { length } = this.getCollaborators();

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

        this.setPopupListActiveItem(activeItemIndex === 0 ? length - 1 : activeItemIndex - 1);
    };

    handleDownArrow = (event: React.KeyboardEvent): void => {
        const { activeItemIndex } = this.state;
        const length = this.handleArrow(event);

        if (!length) {
            return;
        }

        this.setPopupListActiveItem(activeItemIndex === length - 1 ? 0 : activeItemIndex + 1);
    };

    restoreEditor(): EditorState {
        const { cursorPosition: prevCursorPosition, value } = this.props;
        const contentState = ContentState.createFromText(value as string);
        const prevEditorState = withMentionDecorator(EditorState.createWithContent(contentState));
        const cursorPosition = value ? prevCursorPosition : 0;

        return EditorState.forceSelection(
            prevEditorState,
            prevEditorState.getSelection().merge({
                anchorOffset: cursorPosition,
                focusOffset: cursorPosition,
                hasFocus: true,
            }) as SelectionState,
        );
    }

    render(): JSX.Element {
        const { className, isDisabled, itemRowAs, placeholder, ...rest } = this.props;
        const { activeItemIndex, editorState, popupReference } = this.state;

        return (
            <div className={classnames(className, 'ba-ReplyField')}>
                <Editor
                    {...rest}
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
                        itemRowAs={itemRowAs}
                        items={this.getCollaborators()}
                        onActivate={this.setPopupListActiveItem}
                        onSelect={this.handleSelect}
                        reference={popupReference}
                    />
                )}
            </div>
        );
    }
}
