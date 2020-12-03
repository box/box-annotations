import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DecoratedDrawingPath from '../DecoratedDrawingPath';
import DrawingPath from '../DrawingPath';
import DrawingPathGroup, { DRAWING_BORDER_WIDTH, Props } from '../DrawingPathGroup';
import { annotations } from '../__mocks__/drawingData';
import { isVectorEffectSupported } from '../drawingUtil';

jest.mock('../drawingUtil', () => ({
    isVectorEffectSupported: jest.fn().mockImplementation(() => true),
}));

const {
    target: { path_groups: pathGroups },
} = annotations[0];

describe('DrawingPathGroup', () => {
    const getDefaults = (): Props => {
        const { stroke } = pathGroups[0];
        return {
            rootEl: { clientWidth: 200 } as SVGSVGElement,
            stroke,
        };
    };

    const getWrapper = (props = {}): ShallowWrapper => shallow(<DrawingPathGroup {...getDefaults()} {...props} />);

    describe('render()', () => {
        test('should render correct stroke color and size, and DrawingPath', () => {
            const wrapper = getWrapper();

            expect(wrapper.prop('stroke')).toBe('#f00');
            expect(wrapper.prop('strokeWidth')).toBe(1);
            expect(wrapper.exists(DecoratedDrawingPath));
        });

        test.each([true, false])('should render classNames correctly when isActive is %s', isActive => {
            const wrapper = getWrapper({ isActive });

            expect(wrapper.hasClass('ba-DrawingPathGroup')).toBe(true);
            expect(wrapper.hasClass('is-active')).toBe(isActive);
        });

        test('should scale stroke width if vector effect is not supported', () => {
            (isVectorEffectSupported as jest.Mock).mockImplementationOnce(() => false);
            const wrapper = getWrapper();

            expect(wrapper.prop('strokeWidth')).toBe(1 / 2);
        });

        test('should return empty element if vector effect is not supported and rootEl is null', () => {
            (isVectorEffectSupported as jest.Mock).mockImplementationOnce(() => false);
            const wrapper = getWrapper({ rootEl: null });

            expect(wrapper.children()).toHaveLength(0);
            expect(wrapper.exists('path')).toBe(false);
        });

        test('should use render function if provided', () => {
            const {
                stroke: { size },
            } = pathGroups[0];
            const expectedBorderWidth = size + DRAWING_BORDER_WIDTH * 2;
            const wrapper = getWrapper({
                children: (strokeWidthWithBorder: number) => <DrawingPath strokeWidth={strokeWidthWithBorder} />,
            });

            expect(wrapper.find(DrawingPath).exists()).toBe(true);
            expect(wrapper.find(DrawingPath).prop('strokeWidth')).toBe(expectedBorderWidth);
        });
    });
});
