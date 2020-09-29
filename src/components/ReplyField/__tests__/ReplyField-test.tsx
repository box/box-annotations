import React from 'react';
import { getActiveMentionForEditorState } from 'box-ui-elements/es/components/form-elements/draft-js-mention-selector/utils';
import { shallow, ShallowWrapper } from 'enzyme';
import { Editor, EditorState } from 'draft-js';
import PopupList from '../../Popups/PopupList';
import ReplyField, { Props, State } from '../ReplyField';
import { VirtualElement } from '../../Popups/Popper';

const mockMention = {
    blockID: '12345',
    end: 12, // start + mentionString.length + mentionTrigger.length = 0 + 1 + 11 = 12
    mentionString: 'testMention',
    mentionTrigger: '@',
    start: 0,
};

const mockEditorState = EditorState.createEmpty();

jest.mock('box-ui-elements/es/components/form-elements/draft-js-mention-selector/utils', () => ({
    addMention: jest.fn(() => mockEditorState),
    createMentionSelectorState: jest.fn(() => mockEditorState),
    getActiveMentionForEditorState: jest.fn(() => mockMention),
    getFormattedCommentText: jest.fn(() => ({ hasMention: false, text: 'test' })),
}));

jest.mock('lodash/debounce', () => (func: Function) => func);

describe('ReplyField', () => {
    const defaults: Props = {
        className: 'ba-Popup-field',
        collaborators: [
            { id: 'testid1', name: 'test1', item: { id: 'testid1', name: 'test1', type: 'user' } },
            { id: 'testid2', name: 'test2', item: { id: 'testid2', name: 'test2', type: 'user' } },
        ],
        cursorPosition: 0,
        editorState: mockEditorState,
        fetchCollaborators: jest.fn(),
        isDisabled: false,
        onChange: jest.fn(),
        setCursorPosition: jest.fn(),
    };

    const getWrapper = (props = {}): ShallowWrapper<Props, State, ReplyField> =>
        shallow(<ReplyField {...defaults} {...props} />);

    describe('componentDidUpdate()', () => {
        test('should call updatePopupReference if editorState changes', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();
            instance.updatePopupReference = jest.fn();

            wrapper.setProps({ editorState: EditorState.createEmpty() });

            expect(instance.updatePopupReference).toHaveBeenCalled();
        });

        test('should not call updatePopupReference if editorState changes', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();
            instance.updatePopupReference = jest.fn();

            wrapper.setProps({ editorState: mockEditorState });

            expect(instance.updatePopupReference).not.toHaveBeenCalled();
        });
    });

    describe('event handlers', () => {
        test('should handle the editor change event', () => {
            const wrapper = getWrapper();
            const editor = wrapper.find(Editor);
            const instance = wrapper.instance();

            const fetchCollaboratorsSpy = jest.spyOn(instance, 'fetchCollaborators');

            editor.simulate('change', mockEditorState);

            expect(defaults.onChange).toBeCalledWith(mockEditorState);
            expect(fetchCollaboratorsSpy).toHaveBeenCalled();
        });

        test('should handle mouse down', () => {
            const mockEvent = {
                preventDefault: jest.fn(),
            };
            const wrapper = getWrapper();
            wrapper.setState({ popupReference: document.createElement('div') });

            wrapper.find(PopupList).simulate('mousedown', mockEvent);
            expect(mockEvent.preventDefault).toBeCalled();
        });
    });

    describe('fetchCollaborators()', () => {
        test('should not call fetchCollaborators if no activeMention or empty query', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();

            getActiveMentionForEditorState.mockReturnValueOnce(null);
            instance.fetchCollaborators(mockEditorState);

            expect(defaults.fetchCollaborators).not.toHaveBeenCalled();

            getActiveMentionForEditorState.mockReturnValueOnce({ mentionString: '' });
            instance.fetchCollaborators(mockEditorState);

            expect(defaults.fetchCollaborators).not.toHaveBeenCalled();

            getActiveMentionForEditorState.mockReturnValueOnce({ mentionString: 'test' });
            instance.fetchCollaborators(mockEditorState);

            expect(defaults.fetchCollaborators).toHaveBeenCalledWith('test');
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
        test('should set state', () => {
            const wrapper = getWrapper();
            wrapper.instance().setPopupListActiveItem(1, true);

            expect(wrapper.state('activeItemIndex')).toBe(1);
            expect(wrapper.state('popupAutoScroll')).toBe(true);
        });
    });

    describe('handleKeyDown', () => {
        let mockKeyboardEvent: React.KeyboardEvent<HTMLDivElement>;
        let wrapper: ShallowWrapper<Props, State, ReplyField>;
        let instance: ReplyField;
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
            wrapper.setProps({ collaborators: [] });
            instance.handleArrow(mockKeyboardEvent);

            expect(stopDefaultEventSpy).not.toBeCalled();
            expect(setActiveItemSpy).not.toBeCalled();
        });

        test('should increase index if key is down', () => {
            instance.handleDownArrow(mockKeyboardEvent);
            expect(setActiveItemSpy).toBeCalledWith(1, true);
        });

        test('should decrease index if key is up', () => {
            wrapper.setState({ activeItemIndex: 1 });

            instance.handleUpArrow(mockKeyboardEvent);
            expect(setActiveItemSpy).toBeCalledWith(0, true);
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
