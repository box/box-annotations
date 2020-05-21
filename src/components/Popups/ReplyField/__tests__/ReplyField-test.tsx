import React from 'react';
import {
    createMentionSelectorState,
    getActiveMentionForEditorState,
} from 'box-ui-elements/es/components/form-elements/draft-js-mention-selector';
import { shallow, ShallowWrapper } from 'enzyme';
import { ContentState, Editor, EditorState } from 'draft-js';
import PopupList from '../PopupList';
import ReplyField, { Props, State } from '../ReplyField';
import { VirtualElement } from '../../Popper';

const mockMention = {
    blockID: '12345',
    end: 12, // start + mentionString.length + mentionTrigger.length = 0 + 1 + 11 = 12
    mentionString: 'testMention',
    mentionTrigger: '@',
    start: 0,
};

const mockEditorState = EditorState.createEmpty();

jest.mock('box-ui-elements/es/components/form-elements/draft-js-mention-selector', () => ({
    addMention: jest.fn(() => mockEditorState),
    createMentionSelectorState: jest.fn(() => mockEditorState),
    getActiveMentionForEditorState: jest.fn(() => mockMention),
    getFormattedCommentText: jest.fn(() => ({ hasMention: false, text: 'test' })),
}));

describe('components/Popups/ReplyField', () => {
    const defaults: Props = {
        className: 'ba-Popup-field',
        collaborators: [
            { id: 'testid1', name: 'test1', item: { id: 'testid1', name: 'test1', type: 'user' } },
            { id: 'testid2', name: 'test2', item: { id: 'testid2', name: 'test2', type: 'user' } },
        ],
        cursorPosition: 0,
        isDisabled: false,
        onChange: jest.fn(),
        onClick: jest.fn(),
        setCursorPosition: jest.fn(),
        value: '',
    };

    const getWrapper = (props = {}): ShallowWrapper<Props, State, ReplyField> =>
        shallow(<ReplyField {...defaults} {...props} />);

    describe('event handlers', () => {
        test('should handle the editor change event', () => {
            const wrapper = getWrapper();
            const editor = wrapper.find(Editor);
            const instance = wrapper.instance();
            instance.getVirtualElement = jest.fn().mockReturnValue('reference');

            editor.simulate('change', mockEditorState);

            expect(defaults.onChange).toBeCalledWith('test');
            expect(instance.getVirtualElement).toBeCalledWith(mockMention);
            expect(wrapper.state('popupReference')).toBe('reference');
        });

        test('should handle the editor onClick event', () => {
            const wrapper = getWrapper();
            const editor = wrapper.find(Editor);

            editor.simulate('click', 'test');

            expect(defaults.onClick).toBeCalledWith('test');
        });
    });

    describe('getCollaborators()', () => {
        test('should return empty list if no activeMention', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();

            getActiveMentionForEditorState.mockReturnValueOnce(null);

            expect(instance.getCollaborators()).toHaveLength(0);
        });

        test('should return full collaborators list if mentionString length is less than 2', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();

            const mockMentionShort = {
                ...mockMention,
                mentionString: '',
            };

            getActiveMentionForEditorState.mockReturnValueOnce(mockMentionShort);

            expect(instance.getCollaborators()).toMatchObject(defaults.collaborators);
        });

        test('should filter invalid items in collaborators', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();

            // mockMention and defaults.collaborators don't match

            expect(instance.getCollaborators()).toHaveLength(0);
        });

        test('should filter items based on item name', () => {
            const mockMentionTest2 = {
                ...mockMention,
                mentionString: 'test2',
            };

            const wrapper = getWrapper();
            const instance = wrapper.instance();

            getActiveMentionForEditorState.mockReturnValueOnce(mockMentionTest2);

            expect(instance.getCollaborators()).toMatchObject([defaults.collaborators[1]]);
        });

        test('should filter items based on item email', () => {
            const mockCollabs = [
                {
                    id: 'testid3',
                    name: 'test3',
                    item: { id: 'testid3', name: 'test3', type: 'group', email: 'test3@box.com' },
                },
                ...defaults.collaborators,
            ];
            const mockMentionEmail = {
                ...mockMention,
                mentionString: 'box.com',
            };

            const wrapper = getWrapper({ collaborators: mockCollabs });
            const instance = wrapper.instance();

            getActiveMentionForEditorState.mockReturnValueOnce(mockMentionEmail);

            expect(instance.getCollaborators()).toMatchObject([mockCollabs[0]]);
        });
    });

    describe('getVirtualElement()', () => {
        let getSelectionSpy: jest.SpyInstance<Selection | null>;

        beforeEach(() => {
            getSelectionSpy = jest.spyOn(window, 'getSelection');
        });

        test('should return null if no selection', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();

            const virtualElement = instance.getVirtualElement(mockMention);
            expect(virtualElement).toBeNull();
        });

        test('should return null if no focusNode', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();

            getSelectionSpy.mockReturnValue({
                focusNode: null,
            } as Selection);

            const virtualElement = instance.getVirtualElement(mockMention);

            expect(virtualElement).toBeNull();
        });

        test('should return virtual element', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();

            const mockMentionRect = {
                x: 0,
                y: 0,
            };
            const mockTextNode = document.createTextNode('');
            const mockRange = {
                endContainer: mockTextNode,
                endOffset: mockMention.end,
                setStart: jest.fn(),
                setEnd: jest.fn(),
                getBoundingClientRect: () => mockMentionRect,
            };
            getSelectionSpy.mockReturnValue(({
                focusNode: mockTextNode,
                getRangeAt: () => mockRange,
            } as unknown) as Selection);

            const virtualElement = instance.getVirtualElement(mockMention) as VirtualElement;

            expect(mockRange.setStart).toHaveBeenNthCalledWith(1, mockTextNode, 0);
            expect(mockRange.setStart).toHaveBeenNthCalledWith(2, mockTextNode, 12);
            expect(mockRange.setEnd).toHaveBeenNthCalledWith(1, mockTextNode, 0);
            expect(mockRange.setEnd).toHaveBeenNthCalledWith(2, mockTextNode, 12);

            expect(virtualElement.getBoundingClientRect()).toBe(mockMentionRect);
        });
    });

    describe('updatePopupReference()', () => {
        test('should call getVirtualElement and set state', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();

            const getVirtualElementSpy = jest
                .spyOn(instance, 'getVirtualElement')
                .mockReturnValueOnce(('virtualElement' as unknown) as VirtualElement);
            instance.updatePopupReference();

            expect(getVirtualElementSpy).toBeCalledWith(mockMention);
            expect(wrapper.state('popupReference')).toBe('virtualElement');
        });
    });

    describe('handleSelect()', () => {
        test('should call handle Change with updated editorState', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();

            const handleChangeSpy = jest.spyOn(instance, 'handleChange');
            instance.handleSelect(0);

            expect(handleChangeSpy).toBeCalledWith(mockEditorState);
        });
    });

    describe('saveCursorPosition()', () => {
        test('should call setCursorPosition with cursor position', () => {
            const wrapper = getWrapper();
            wrapper.setState({ editorState: mockEditorState });

            wrapper.instance().saveCursorPosition();

            expect(defaults.setCursorPosition).toBeCalledWith(0);
        });
    });

    describe('stopDefaultEvent()', () => {
        test('should prevent default and stop propagation', () => {
            const mockEvent = ({
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
            } as unknown) as React.SyntheticEvent;

            const wrapper = getWrapper();
            wrapper.instance().stopDefaultEvent(mockEvent);

            expect(mockEvent.preventDefault).toBeCalled();
            expect(mockEvent.stopPropagation).toBeCalled();
        });
    });

    describe('setPopupListActiveItem()', () => {
        const wrapper = getWrapper();
        wrapper.instance().setPopupListActiveItem(1);

        expect(wrapper.state('activeItemIndex')).toBe(1);
    });

    describe('handleKeyDown', () => {
        let mockKeyboardEvent: React.KeyboardEvent<HTMLDivElement>;
        let wrapper: ShallowWrapper<Props, State, ReplyField>;
        let instance: ReplyField;
        let getCollaboratorsSpy: jest.SpyInstance;
        let stopDefaultEventSpy: jest.SpyInstance;
        let setActiveItemSpy: jest.SpyInstance;

        beforeEach(() => {
            mockKeyboardEvent = ({
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
            } as unknown) as React.KeyboardEvent<HTMLDivElement>;

            wrapper = getWrapper();
            wrapper.setState({ activeItemIndex: 0, popupReference: ('popupReference' as unknown) as VirtualElement });
            instance = wrapper.instance();

            getCollaboratorsSpy = jest.spyOn(instance, 'getCollaborators').mockReturnValue([
                { id: 'testid1', name: 'test1' },
                { id: 'testid2', name: 'test2' },
            ]);
            stopDefaultEventSpy = jest.spyOn(instance, 'stopDefaultEvent');
            setActiveItemSpy = jest.spyOn(instance, 'setPopupListActiveItem');
        });

        test('should return not-handled if popup is not showing', () => {
            wrapper.setState({ popupReference: null });

            expect(instance.handleReturn(mockKeyboardEvent)).toEqual('not-handled');
        });

        test('should call handleSelect', () => {
            instance.handleReturn(mockKeyboardEvent);

            expect(stopDefaultEventSpy).toBeCalledWith(mockKeyboardEvent);
            expect(setActiveItemSpy).toBeCalledWith(0);
        });

        test('should do nothing if collaborators length is 0', () => {
            getCollaboratorsSpy.mockReturnValueOnce([]);
            instance.handleArrow(mockKeyboardEvent);

            expect(stopDefaultEventSpy).not.toBeCalled();
            expect(setActiveItemSpy).not.toBeCalled();
        });

        test('should increase index if key is down', () => {
            instance.handleDownArrow(mockKeyboardEvent);
            expect(setActiveItemSpy).toBeCalledWith(1);
        });

        test('should decrease index if key is up', () => {
            wrapper.setState({ activeItemIndex: 1 });

            instance.handleUpArrow(mockKeyboardEvent);
            expect(setActiveItemSpy).toBeCalledWith(0);
        });
    });

    describe('restoreEditor()', () => {
        test('should restore value and cursor position', () => {
            const wrapper = getWrapper({ cursorPosition: 1, value: 'test' });

            createMentionSelectorState.mockImplementationOnce((value: string) =>
                EditorState.createWithContent(ContentState.createFromText(value)),
            );
            const editorState = wrapper.instance().restoreEditor();

            expect(editorState.getCurrentContent().getPlainText()).toEqual('test');
            expect(editorState.getSelection().getFocusOffset()).toEqual(1);
        });

        test('should reset cursor position if value is empty', () => {
            const wrapper = getWrapper({ cursorPosition: 1 });

            const editorState = wrapper.instance().restoreEditor();

            expect(editorState.getSelection().getFocusOffset()).toEqual(0);
        });
    });

    describe('render()', () => {
        test('should render the editor with right props', () => {
            const wrapper = getWrapper();

            expect(wrapper.prop('className')).toBe('ba-Popup-field ba-ReplyField');
        });

        test('should render PopupList if popupreference is not null', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists(PopupList)).toBe(false);

            wrapper.setState({ popupReference: document.createElement('div') });
            expect(wrapper.exists(PopupList)).toBe(true);
        });
    });
});
