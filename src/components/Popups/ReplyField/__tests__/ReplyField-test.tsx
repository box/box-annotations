import React from 'react';
import { EditorState } from 'draft-js';
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

    describe('render()', () => {
        test('should render the editor with right props', () => {
            const wrapper = getWrapper();

            expect(wrapper.prop('className')).toBe('ba-Popup-field ba-ReplyField');
        });
    });

    describe('handleChange()', () => {
        test('should call onChange', () => {
            const wrapper = getWrapper();

            wrapper.instance().handleChange(({
                getCurrentContent: jest.fn().mockReturnValue({ getPlainText: jest.fn().mockReturnValue('test') }),
            } as unknown) as EditorState);

            expect(defaults.onChange).toBeCalledWith('test');
        });
    });
});
