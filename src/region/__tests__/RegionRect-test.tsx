import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { rect } from '../__mocks__/data';
import RegionRect from '../RegionRect';

describe('RegionRect', () => {
    const getWrapper = (props = {}): ShallowWrapper => {
        return shallow(<RegionRect {...props} />);
    };

    describe('render()', () => {
        test('should render a rect based on the provided shape', () => {
            const wrapper = getWrapper({ shape: rect });

            expect(wrapper).toMatchInlineSnapshot(`
                <rect
                  className="ba-RegionRect"
                  height={10}
                  rx={6}
                  width={10}
                  x={10}
                  y={10}
                />
            `);
        });

        test('should render nothing if no shape is provided', () => {
            const wrapper = getWrapper();

            expect(wrapper.isEmptyRender()).toBe(true);
        });
    });
});
