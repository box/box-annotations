import * as React from 'react';
import { shallow } from 'enzyme';

import Comment from '../Comment';

const TIME_STRING_SEPT_27_2017 = '2017-09-27T10:40:41-07:00';

const USER = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov'
};

const annotation = {
    id: '123',
    createdAt: TIME_STRING_SEPT_27_2017,
    createdBy: USER,
    message: 'test',
    permissions: {}
};

describe('components/Comment', () => {
    beforeEach(() => {});

    const render = (props = {}) => shallow(<Comment {...annotation} {...props} />).dive();

    test('should correctly render annotation', () => {
        const wrapper = render();
        expect(wrapper).toMatchSnapshot();
    });

    test('should not allow actions when annotation is pending', () => {
        const wrapper = render({
            onDelete: jest.fn(),
            permissions: { can_delete: true },
            isPending: true
        });
        expect(wrapper.find('InlineDelete').length).toEqual(0);
    });

    test('should render an error when one is defined', () => {
        const wrapper = render({
            onDelete: jest.fn(),
            error: {
                title: 'error',
                message: 'errorrrrr'
            }
        });

        expect(wrapper).toMatchSnapshot();
    });
});
