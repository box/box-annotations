import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import ReplyField, { Props } from '../ReplyField';

describe('components/Popups/ReplyField', () => {
    const defaults: Props = {
        className: 'ba-Popup-text',
        disabled: false,
        onChange: jest.fn(),
        onClick: jest.fn(),
        value: '',
    };

    const getWrapper = (props = {}): ShallowWrapper => shallow(<ReplyField {...defaults} {...props} />);

    describe('event handlers', () => {
        test('should call onChange event', () => {
            const wrapper = getWrapper();
            const textarea = wrapper.find('textarea');

            textarea.simulate('change', 'test');
            textarea.simulate('click', 'test');

            expect(defaults.onChange).toHaveBeenCalledWith('test');
            expect(defaults.onClick).toHaveBeenCalledWith('test');
        });
    });

    describe('render()', () => {
        test('should render the textarea with right props', () => {
            const wrapper = getWrapper();

            expect(wrapper.prop('className')).toBe('ba-TextArea ba-Popup-text');
        });
    });
});
