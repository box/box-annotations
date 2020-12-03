import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DecoratedDrawingPath, { Props } from '../DecoratedDrawingPath';
import DrawingPath from '../DrawingPath';

describe('DecoratedDrawingPath', () => {
    const getDefaults = (): Props => ({
        borderStrokeWidth: 3,
        isDecorated: true,
        points: [
            { x: 10, y: 10 },
            { x: 12, y: 12 },
            { x: 14, y: 14 },
        ],
    });

    const getWrapper = (props = {}): ShallowWrapper => shallow(<DecoratedDrawingPath {...getDefaults()} {...props} />);

    describe('render()', () => {
        test('should render path, shadow, and border', () => {
            const wrapper = getWrapper();

            const shadow = wrapper.find('.ba-DecoratedDrawingPath-shadow');
            const border = wrapper.find('.ba-DecoratedDrawingPath-border');

            expect(wrapper.find(DrawingPath)).toHaveLength(3);
            expect(shadow.prop('filter')).toBe('url(#ba-DrawingSVG-shadow)');
            expect(border.prop('stroke')).toBe('#fff');
            expect(border.prop('strokeWidth')).toBe(3);
        });

        test('should not render decoration if decorated is false', () => {
            const wrapper = getWrapper({ isDecorated: false });

            expect(wrapper.find(DrawingPath)).toHaveLength(1);
            expect(wrapper.exists('.ba-DecoratedDrawingPath-decoration')).toBe(false);
            expect(wrapper.exists('.ba-DecoratedDrawingPath-shadow')).toBe(false);
            expect(wrapper.exists('.ba-DecoratedDrawingPath-border')).toBe(false);
        });
    });
});
