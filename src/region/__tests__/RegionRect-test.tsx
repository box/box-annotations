import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import RegionRect from '../RegionRect';
import { styleShape } from '../regionUtil';

jest.mock('../regionUtil', () => ({
    styleShape: jest.fn(value => value),
}));

describe('src/region/RegionRect', () => {
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionRect {...props} />);

    describe('render', () => {
        test('should call styleShape with the provided shape prop value', () => {
            const shape = { height: 10, width: 10, x: 10, y: 10 };
            const wrapper = getWrapper({ shape });

            expect(styleShape).toHaveBeenCalledWith(shape);
            expect(wrapper.prop('style')).toEqual(shape);
        });

        test.each([true, false])('should render classNames correctly when isActive is %s', isActive => {
            const wrapper = getWrapper({ isActive });

            expect(wrapper.hasClass('ba-RegionRect')).toBe(true);
            expect(wrapper.hasClass('is-active')).toBe(isActive);
        });
    });
});
