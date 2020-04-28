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

    const mockEditorState = ({
        getCurrentContent: () => ({ getPlainText: () => 'test' }),
    } as unknown) as EditorState;

    const getWrapper = (props = {}): ShallowWrapper<Props, State, ReplyField> =>
        shallow(<ReplyField {...defaults} {...props} />);

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
});
