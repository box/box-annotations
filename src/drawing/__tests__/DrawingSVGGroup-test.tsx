import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingSVGGroup, { Props } from '../DrawingSVGGroup';

jest.mock('../../common/useMountId');

describe('DrawingSVGGroup', () => {
    const getDefaults = (): Props => ({
        onMount: jest.fn(),
    });
    const getWrapper = (props: Partial<Props>): ShallowWrapper =>
        shallow(<DrawingSVGGroup {...getDefaults()} {...props} />);

    describe('render', () => {
        test('should render with provided props', () => {
            const wrapper = getWrapper({ children: <path />, className: 'foo' });

            expect(wrapper.props()).toMatchObject({
                className: 'foo',
                'data-ba-reference-id': '123',
            });
            expect(wrapper.exists('path')).toBe(true);
        });

        test('should call onMount with uuid', () => {
            const onMount = jest.fn();
            getWrapper({ onMount });

            expect(onMount).toHaveBeenCalledWith('123');
        });
    });
});
