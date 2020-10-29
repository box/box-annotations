import React, { MutableRefObject } from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import RegionRect from '../RegionRect';
import { styleShape } from '../regionUtil';

jest.mock('../regionUtil', () => ({
    styleShape: jest.fn(value => value),
}));

describe('RegionRect', () => {
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionRect {...props} />);
    const mockInitalRef = { current: '123' } as MutableRefObject<string>;

    beforeEach(() => {
        jest.spyOn(React, 'useEffect').mockImplementation(f => f());
        jest.spyOn(React, 'useRef').mockImplementation(() => mockInitalRef);
    });

    describe('render', () => {
        test('should call styleShape with the provided shape prop value', () => {
            const shape = { height: 10, width: 10, x: 10, y: 10 };
            const wrapper = getWrapper({ shape });

            expect(styleShape).toHaveBeenCalledWith(shape);
            expect(wrapper.find('div').prop('style')).toEqual(shape);
        });

        test.each([true, false])('should render classNames correctly when isActive is %s', isActive => {
            const wrapper = getWrapper({ isActive });
            const divEl = wrapper.find('div');

            expect(divEl.hasClass('ba-RegionRect')).toBe(true);
            expect(divEl.hasClass('is-active')).toBe(isActive);
        });
    });

    describe('onMount()', () => {
        test('should call onMount with generated uuid', () => {
            const handleMount = jest.fn();
            getWrapper({ onMount: handleMount });

            expect(handleMount).toHaveBeenCalledWith(expect.any(String));
        });
    });
});
