import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { Editor, EditorState } from 'draft-js';
import PopupList from '../PopupList';
import ReplyField, { Props, State } from '../ReplyField';
import { VirtualElement } from '../../Popper';

const mockMention = {
    blockID: '12345',
    end: 1,
    mentionString: 'testMention',
    mentionTrigger: '@',
    start: 0,
};

jest.mock('box-ui-elements/es/components/form-elements/draft-js-mention-selector', () => ({
    getActiveMentionForEditorState: () => mockMention,
}));

describe('components/Popups/ReplyField', () => {
    const defaults: Props = {
        className: 'ba-Popup-field',
        cursorPosition: 0,
        isDisabled: false,
        onChange: jest.fn(),
        onClick: jest.fn(),
        onMention: jest.fn(),
        setCursorPosition: jest.fn(),
        value: '',
    };

    const getWrapper = (props = {}): ShallowWrapper<Props, State, ReplyField> =>
        shallow(<ReplyField {...defaults} {...props} />);

    const mockEditorState = ({
        getCurrentContent: () => ({ getPlainText: () => 'test' }),
        getSelection: () => ({ getFocusOffset: () => 0 }),
    } as unknown) as EditorState;

    describe('render()', () => {
        test('should render the editor with right props', () => {
            const wrapper = getWrapper();

            expect(wrapper.prop('className')).toBe('ba-Popup-field ba-ReplyField');
        });

        test('should render PopupList if popupreference is not null', () => {
            const wrapper = getWrapper();
            wrapper.setState({ popupReference: document.createElement('div') });

            expect(wrapper.exists(PopupList)).toBe(true);
        });
    });

    describe('event handlers', () => {
        test('should handle the editor change event', () => {
            const wrapper = getWrapper();
            const editor = wrapper.find(Editor);
            const instance = wrapper.instance();
            instance.getVirtualElement = jest.fn().mockReturnValue('reference');

            editor.simulate('change', mockEditorState);

            expect(defaults.onChange).toBeCalledWith('test');
            expect(defaults.onMention).toBeCalledWith('testMention');
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
            expect(mockRange.setStart).toHaveBeenNthCalledWith(2, mockTextNode, 1);
            expect(mockRange.setEnd).toHaveBeenNthCalledWith(1, mockTextNode, 0);
            expect(mockRange.setEnd).toHaveBeenNthCalledWith(2, mockTextNode, 1);

            expect(virtualElement.getBoundingClientRect()).toBe(mockMentionRect);
        });
    });

    describe('focusEditor()', () => {
        test('should call editor ref focus', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();

            const editorRef = ({
                focus: jest.fn(),
            } as unknown) as Editor;

            instance.editorRef = { current: editorRef };
            instance.focusEditor();

            expect(editorRef.focus).toBeCalled();
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
});
