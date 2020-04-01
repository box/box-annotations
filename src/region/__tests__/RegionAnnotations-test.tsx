import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { createIntl } from 'react-intl';
import { annotations } from '../__mocks__/data';
import RegionAnnotation from '../RegionAnnotation';
import RegionAnnotations from '../RegionAnnotations';

describe('RegionAnnotations', () => {
    const defaults = {
        annotations: [],
        intl: createIntl({ locale: 'en-US ' }),
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionAnnotations {...defaults} {...props} />);

    describe('render()', () => {
        test('should render one RegionAnnotation per annotation', () => {
            const wrapper = getWrapper({ annotations });

            expect(wrapper.exists('.ba-RegionAnnotations-list')).toBe(true);
            expect(wrapper.find(RegionAnnotation).length).toBe(3);
        });
    });
});
