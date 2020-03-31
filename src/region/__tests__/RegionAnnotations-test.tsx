import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { annotations } from '../__mocks__/data';
import RegionAnnotation from '../RegionAnnotation';
import RegionAnnotations from '../RegionAnnotations';

describe('RegionAnnotations', () => {
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionAnnotations annotations={[]} {...props} />);

    describe('render()', () => {
        test('should render one RegionAnnotation per annotation', () => {
            const wrapper = getWrapper({ annotations });

            expect(wrapper.hasClass('ba-Regions')).toBe(true);
            expect(wrapper.find(RegionAnnotation).length).toBe(3);
        });
    });
});
