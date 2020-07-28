import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import ReplyButton from '../ReplyButton';

describe('ReplyButton', () => {
    const defaults = {
        isDisabled: false,
        isPrimary: false,
        type: 'button' as const,
    };
    const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<ReplyButton {...defaults} {...props} />);

    test('should invoke its click callback when clicked', () => {
        const onClick = jest.fn();
        const wrapper = getWrapper({ onClick });

        wrapper.simulate('click', event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(event.stopPropagation).not.toHaveBeenCalled();
        expect(onClick).toHaveBeenCalled();
    });

    test('should not invoke its click callback if disabled', () => {
        const onClick = jest.fn();
        const wrapper = getWrapper({ isDisabled: true, onClick });

        wrapper.simulate('click', event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(onClick).not.toHaveBeenCalled();
    });

    test.each([true, false])('should render the correct class when isDisabled is %s', isDisabled => {
        const wrapper = getWrapper({ isDisabled });
        expect(wrapper.hasClass('is-disabled')).toBe(isDisabled);
    });

    test.each([true, false])('should render the correct class when isPrimary is %s', isPrimary => {
        const wrapper = getWrapper({ isPrimary });
        expect(wrapper.hasClass('btn-primary')).toBe(isPrimary);
    });
});
