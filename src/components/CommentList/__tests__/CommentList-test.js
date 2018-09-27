import * as React from 'react';
import { shallow } from 'enzyme';

import CommentList from '../CommentList';

const TIME_STRING_SEPT_27_2017 = '2017-09-27T10:40:41-07:00';

const USER = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov'
};

const comments = [
    {
        id: '123',
        createdAt: TIME_STRING_SEPT_27_2017,
        createdBy: USER,
        message: 'test',
        permissions: {}
    },
    {
        id: '456',
        createdAt: TIME_STRING_SEPT_27_2017,
        createdBy: USER,
        message: 'test',
        permissions: {}
    }
];

const onDelete = jest.fn();

describe('components/CommentList', () => {
    test('should correctly render a list of comments', () => {
        const wrapper = shallow(<CommentList comments={comments} onDelete={onDelete} />).dive();
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.ba-comment-list-item').length).toEqual(2);
    });
});
