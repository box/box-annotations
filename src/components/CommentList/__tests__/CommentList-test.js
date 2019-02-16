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
        const wrapper = shallow(<CommentList comments={comments} onDelete={onDelete} />);
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.ba-comment-list-item').length).toEqual(2);
    });

    test('should scroll to the bottom on componentDidUpdate()', () => {
        const wrapper = shallow(<CommentList comments={comments} onDelete={onDelete} />);
        const instance = wrapper.instance();
        instance.scrollToBottom = jest.fn();

        wrapper.setProps({ comments: [...comments, ...comments] });
        expect(instance.scrollToBottom).toBeCalled();
    });
});
