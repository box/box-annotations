import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import ReplyButton from '../ReplyButton';

describe('components/ReplyForm/ReplyButton', () => {
    const defaults = {
        isDisabled: false,
        isPrimary: false,
        type: 'button' as const,
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<ReplyButton {...defaults} {...props} />);

    test.each([true, false])('should render the correct class when isDisabled is %s', isDisabled => {
        const wrapper = getWrapper({ isDisabled });
        expect(wrapper.hasClass('is-disabled')).toBe(isDisabled);
    });

    test.each([true, false])('should render the correct class when isPrimary is %s', isPrimary => {
        const wrapper = getWrapper({ isPrimary });
        expect(wrapper.hasClass('btn-primary')).toBe(isPrimary);
    });
});
