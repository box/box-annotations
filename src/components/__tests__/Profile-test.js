import * as React from 'react';
import { shallow } from 'enzyme';

import Profile from '../Profile';

describe('components/Profile', () => {
    test('should display user profile with created by date', () => {
        const user = {
            id: '123',
            name: 'Kanye West',
            avatarUrl: 'foo.bar'
        };
        const date = '2017-09-27T10:40:41-07:00';

        const wrapper = shallow(<Profile user={user} createdBy={date} />);
        expect(wrapper).toMatchSnapshot();
    });
});
