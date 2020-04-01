import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import RegionAnnotation from '../RegionAnnotation';
import RegionCreator from '../RegionCreator';

describe('RegionCreator', () => {
    const defaults = {
        canDraw: true,
        onDone: jest.fn(),
        onDraw: jest.fn(),
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionCreator {...defaults} {...props} />);

    describe('render()', () => {
        test('should render one RegionAnnotation per annotation', () => {
            const wrapper = getWrapper();

            expect(wrapper.find(RegionAnnotation).length).toBe(0);
        });
    });
});
