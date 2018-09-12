import * as React from 'react';
import { shallow } from 'enzyme';

import Timestamp from '../Timestamp';

const TIME_STRING_SEPT_27_2017 = '2017-09-27T10:40:41-07:00';

describe('components/Annotation/Timestamp', () => {
    test('should correctly render annotation', () => {
        const unixTime = new Date(TIME_STRING_SEPT_27_2017).getTime();

        const wrapper = shallow(<Timestamp time={TIME_STRING_SEPT_27_2017} />).dive();
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('ReadableTime').prop('timestamp')).toEqual(unixTime);
    });
});
