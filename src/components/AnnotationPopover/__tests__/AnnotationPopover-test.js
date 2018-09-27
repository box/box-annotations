import * as React from 'react';
import { shallow } from 'enzyme';

import AnnotationPopover from '../AnnotationPopover';

const onDelete = jest.fn();
const onCreate = jest.fn();
const onCancel = jest.fn();

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

describe('components/AnnotationPopover', () => {
    const render = (props = {}) =>
        shallow(
            <AnnotationPopover
                canAnnotate={false}
                canDelete={false}
                onCreate={onCreate}
                onCancel={onCancel}
                onDelete={onDelete}
                {...props}
            />
        );

    test('should correctly render the list popover', () => {
        const wrapper = render({
            canAnnotate: true,
            comments
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should render the create popover', () => {
        const wrapper = render({
            canAnnotate: true,
            comments: []
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should render the view-only list popover', () => {
        const wrapper = render({
            comments
        });
        expect(wrapper).toMatchSnapshot();
    });
});
