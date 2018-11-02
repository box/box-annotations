import * as React from 'react';
import { shallow } from 'enzyme';

import Overlay from '../Overlay';

describe('components/Overlay', () => {
    test('should correctly render a Focus Trap if not on mobile', () => {
        const wrapper = shallow(<Overlay shouldDefaultFocus={true} />).dive();
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('FocusTrap').length).toEqual(1);
    });

    test('should correctly render a div without a Focus Trap if on mobile', () => {
        const wrapper = shallow(<Overlay shouldDefaultFocus={false} />);
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('FocusTrap').length).toEqual(0);
    });
});
