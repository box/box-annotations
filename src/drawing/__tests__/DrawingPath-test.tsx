import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingPath, { getPathCommands, Props } from '../DrawingPath';

describe('DrawingPath', () => {
    const getDefaults = (): Props => ({
        borderStrokeWidth: 3,
        decorated: true,
        points: [
            { x: 10, y: 10 },
            { x: 12, y: 12 },
            { x: 14, y: 14 },
        ],
    });

    const getWrapper = (props = {}): ShallowWrapper => shallow(<DrawingPath {...getDefaults()} {...props} />);

    describe('render()', () => {
        test('should render path, shadow, and border', () => {
            const wrapper = getWrapper();

            const shadow = wrapper.find('.ba-DrawingPath-shadow');
            const border = wrapper.find('.ba-DrawingPath-border');

            expect(wrapper.find('path')).toHaveLength(3);
            expect(shadow.prop('filter')).toBe('url(#ba-DrawingSVG-shadow)');
            expect(border.prop('stroke')).toBe('#fff');
            expect(border.prop('strokeWidth')).toBe(3);
        });

        test('should not render decoration if decorated is false', () => {
            const wrapper = getWrapper({ decorated: false });

            expect(wrapper.find('path')).toHaveLength(1);
            expect(wrapper.exists('.ba-DrawingPath-decoration')).toBe(false);
            expect(wrapper.exists('.ba-DrawingPath-shadow')).toBe(false);
            expect(wrapper.exists('.ba-DrawingPath-border')).toBe(false);
        });
    });

    describe('getPathCommands()', () => {
        test('should return empty string if no points', () => {
            expect(getPathCommands([])).toBe('');
        });

        test('should return path commands with bezier smoothing', () => {
            expect(getPathCommands(getDefaults().points)).toBe('M 10 10  C 11 11, 12 12, 13 13 ');
        });
    });
});
