import * as React from 'react';
import { shallow } from 'enzyme';

import AnnotationHeader from '../AnnotationHeader';

const TIME_STRING_SEPT_27_2017 = '2017-09-27T10:40:41-07:00';

const USER = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov'
};
const ANONYMOUS_USER = 'Some User';

const headerProps = {
    id: '123',
    createdAt: TIME_STRING_SEPT_27_2017,
    createdBy: USER,
    permissions: {}
};

describe('components/Annotation/AnnotationHeader', () => {
    const render = (props = {}) => shallow(<AnnotationHeader {...headerProps} {...props} />).dive();

    test('should correctly render annotation header', () => {
        const wrapper = render({ isAnonymousUser: true });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('Timestamp').prop('time')).toEqual(TIME_STRING_SEPT_27_2017);
        expect(wrapper.find('UserLink').prop('name')).toEqual(USER.name);
    });

    test('should correctly display anonymous username if no name was provided in createdBy', () => {
        const unknownUser = {
            type: 'user',
            id: '0'
        };
        const wrapper = render({ createdBy: unknownUser });
        expect(wrapper.find('UserLink').prop('name')).toEqual(ANONYMOUS_USER);
    });

    // eslint-disable-next-line
    test('should allow user to delete if they have delete permissions on the annotation and delete handler is defined', () => {
        const wrapper = render({ onDelete: jest.fn(), permissions: { can_delete: true } });
        expect(wrapper.find('InlineDelete').length).toEqual(1);
    });

    test('should not allow user to delete if they lack delete permissions on the annotation', () => {
        const wrapper = render({ onDelete: jest.fn() });
        expect(wrapper.find('InlineDelete').length).toEqual(0);
    });

    test('should not allow user to delete if onDelete handler is undefined', () => {
        const wrapper = render();
        expect(wrapper.find('InlineDelete').length).toEqual(0);
    });
});
