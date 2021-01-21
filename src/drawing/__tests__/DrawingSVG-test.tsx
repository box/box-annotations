import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingSVG from '../DrawingSVG';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useRef: jest.fn().mockReturnValue({ current: 'ba-DrawingSVG-shadow_123' }),
}));

describe('DrawingSVG', () => {
    const Component = (): JSX.Element => <div>Test</div>;
    const getWrapper = (props = {}): ShallowWrapper =>
        shallow(
            <DrawingSVG {...props}>
                <Component />
            </DrawingSVG>,
        );

    describe('render()', () => {
        test('should render svg, filter, and children', () => {
            const wrapper = getWrapper();

            expect(wrapper.hasClass('ba-DrawingSVG')).toBe(true);
            expect(wrapper.find('filter').prop('id')).toBe('ba-DrawingSVG-shadow_123');
            expect(wrapper.exists('feGaussianBlur')).toBe(true);
            expect(wrapper.exists(Component)).toBe(true);
        });
    });
});
