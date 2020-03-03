import * as React from 'react';
import { shallow } from 'enzyme';

import AnnotationPopover from '../AnnotationPopover';
import { TYPES } from '../../../constants';

const fnMock = jest.fn();
const position = jest.fn();

const TIME_STRING_SEPT_27_2017 = '2017-09-27T10:40:41-07:00';

const USER = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov',
};

const comments = [
    {
        id: '123',
        createdAt: TIME_STRING_SEPT_27_2017,
        createdBy: USER,
        message: 'test',
        permissions: {},
    },
    {
        id: '456',
        createdAt: TIME_STRING_SEPT_27_2017,
        createdBy: USER,
        message: 'test',
        permissions: {},
    },
];

describe('components/AnnotationPopover', () => {
    const render = (props = {}) =>
        shallow(
            <AnnotationPopover
                canAnnotate={false}
                canDelete={false}
                onCancel={fnMock}
                onCreate={fnMock}
                onDelete={fnMock}
                position={position}
                {...props}
            />,
        );

    test('should position the component on componentDidUpdate()', () => {
        const wrapper = render({ comments });
        wrapper.setProps({ canAnnotate: true });
        expect(position).toBeCalled();
    });

    test('should correctly render a view-only popover with comments', () => {
        const wrapper = render({ comments });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.ba-inline-popover').length).toEqual(0);
        expect(position).toBeCalled();
    });

    test('should render a view-only annotation with a annotator label and no comments', () => {
        const wrapper = render({
            comments: [],
            type: TYPES.highlight,
        });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.ba-inline-popover').length).toEqual(1);
    });

    test('should correctly render an annotation with a annotator label and no comments', () => {
        const wrapper = render({
            canAnnotate: true,
            comments: [],
            type: TYPES.highlight,
        });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.ba-inline-popover').length).toEqual(1);
    });

    test('should correctly render a popover with comments and reply textarea', () => {
        const wrapper = render({
            canAnnotate: true,
            comments,
        });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.ba-inline-popover').length).toEqual(0);
    });

    test('should correctly render a pending annotation', () => {
        const wrapper = render({
            isPending: true,
            canAnnotate: true,
        });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.ba-inline-popover').length).toEqual(0);
    });
});
