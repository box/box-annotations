import React from 'react';
import { Editor, EditorState } from 'draft-js';
import { shallow, ShallowWrapper } from 'enzyme';
import ReplyField, { Props, State } from '../ReplyField';

describe('components/Popups/ReplyField', () => {
    const defaults: Props = {
        className: 'ba-Popup-field',
        cursorPosition: 0,
        isDisabled: false,
        onChange: jest.fn(),
        onClick: jest.fn(),
        setCursorPosition: jest.fn(),
        value: '',
    };

    const getWrapper = (props = {}): ShallowWrapper<Props, State, ReplyField> =>
        shallow(<ReplyField {...defaults} {...props} />);

    const mockEditorState = ({
        getCurrentContent: () => ({ getPlainText: () => 'test' }),
        getSelection: () => ({ getFocusOffset: () => 0 }),
    } as unknown) as EditorState;

    const mockEditor = ({
        focus: jest.fn(),
    } as unknown) as Editor;

    describe('render()', () => {
        test('should render the editor with right props', () => {
            const wrapper = getWrapper();

            expect(wrapper.prop('className')).toBe('ba-Popup-field ba-ReplyField');
        });
    });

    describe('event handlers', () => {
        test('should handle the editor onChange event', () => {
            const wrapper = getWrapper();
            const editor = wrapper.find(Editor);
            jest.spyOn(wrapper.instance(), 'getActiveMentionForEditorState').mockReturnValue(null);

            editor.simulate('change', mockEditorState);

            expect(defaults.onChange).toBeCalledWith('test');
        });

        test('should handle the editor onClick event', () => {
            const wrapper = getWrapper();
            const editor = wrapper.find(Editor);

            editor.simulate('click', 'test');

            expect(defaults.onClick).toBeCalledWith('test');
        });
    });

    describe('focusEditor()', () => {
        test('should call editor ref focus', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();

            instance.focusEditor();
            expect(mockEditor.focus).not.toBeCalled();

            instance.editorRef.current = mockEditor;
            instance.focusEditor();

            expect(mockEditor.focus).toBeCalled();
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
