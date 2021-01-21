import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingSVG from '../DrawingSVG';

describe('DrawingSVG', () => {
    const filterID = 'ba-DrawingSVG-shadow_123';
    const Component = (): JSX.Element => <div>Test</div>;
    const getWrapper = (props = {}): ShallowWrapper =>
        shallow(
            <DrawingSVG filterID={filterID} {...props}>
                <Component />
            </DrawingSVG>,
        );

    describe('render()', () => {
        test('should render svg, filter, and children', () => {
            const wrapper = getWrapper();

            expect(wrapper.hasClass('ba-DrawingSVG')).toBe(true);
            expect(wrapper.find('filter').prop('id')).toBe(filterID);
            expect(wrapper.exists('feGaussianBlur')).toBe(true);
            expect(wrapper.exists(Component)).toBe(true);
        });
    });
});
