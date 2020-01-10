import * as React from 'react';
import { shallow } from 'enzyme';

import Comment from '../Comment';

const TIME_STRING_SEPT_27_2017 = '2017-09-27T10:40:41-07:00';

const USER = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov',
};

const comment = {
    id: '123',
    createdAt: TIME_STRING_SEPT_27_2017,
    createdBy: USER,
    message: 'test',
    permissions: {},
};

describe('components/Comment', () => {
    beforeEach(() => {});

    const render = (props = {}) => shallow(<Comment {...comment} {...props} />).dive();

    test('should correctly render comment', () => {
        const wrapper = render();
        expect(wrapper).toMatchSnapshot();
    });
});
