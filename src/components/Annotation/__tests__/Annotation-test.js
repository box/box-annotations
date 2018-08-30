import * as React from 'react';
import { mount, shallow } from 'enzyme';

import Annotation from '../Annotation';

const USER = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov'
};

const TIME_STRING_SEPT_27_2017 = '2017-09-27T10:40:41-07:00';

describe('components/Annotation', () => {
    beforeEach(() => {});

    const render = (props = {}) =>
        shallow(
            <Annotation
                created_at={TIME_STRING_SEPT_27_2017}
                created_by={USER}
                message='test'
                permissions={{}}
                {...props}
            />
        );

    test('should correctly render annotation', () => {
        const unixTime = new Date(TIME_STRING_SEPT_27_2017).getTime();
        const annotation = {
            created_at: TIME_STRING_SEPT_27_2017,
            message: 'test',
            created_by: USER
        };

        const wrapper = shallow(<Annotation id='123' {...annotation} />);

        // validating that the Tooltip and the annotation posted time are properly set
        expect(wrapper.find('ReadableTime').prop('timestamp')).toEqual(unixTime);

        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly add ba-is-focused class when annotation is focused', () => {
        const wrapper = render();
        const annotation = wrapper.find('.ba-annotation');

        expect(annotation.hasClass('ba-is-focused')).toBe(false);
        annotation.simulate('focus');
        expect(wrapper.find('.ba-annotation').hasClass('ba-is-focused')).toBe(true);
        annotation.simulate('blur');
        expect(wrapper.find('.ba-annotation').hasClass('ba-is-focused')).toBe(false);
    });

    test('should correctly display anonymous username if no name was provided in created_by', () => {
        const unknownUser = {
            type: 'user',
            id: '0'
        };
        const wrapper = render({ created_by: unknownUser });
        expect(wrapper.find('UserLink').length).toEqual(0);
    });

    test('should not allow actions when annotation is pending', () => {
        const annotation = {
            created_at: TIME_STRING_SEPT_27_2017,
            message: 'test',
            created_by: USER,
            permissions: { can_delete: true },
            isPending: true
        };

        const wrapper = shallow(<Annotation id='123' {...annotation} onDelete={jest.fn()} />);

        expect(wrapper.find('InlineDelete').length).toEqual(0);
    });

    // eslint-disable-next-line
    test('should allow user to delete if they have delete permissions on the annotation and delete handler is defined', () => {
        const annotation = {
            created_at: TIME_STRING_SEPT_27_2017,
            message: 'test',
            created_by: USER,
            permissions: { can_delete: true }
        };

        const wrapper = shallow(<Annotation id='123' {...annotation} onDelete={jest.fn()} />);

        expect(wrapper.find('InlineDelete').length).toEqual(1);
    });

    test('should not allow user to delete if they lack delete permissions on the annotation', () => {
        const annotation = {
            created_at: TIME_STRING_SEPT_27_2017,
            message: 'test',
            created_by: USER,
            permissions: {}
        };

        const wrapper = shallow(<Annotation id='123' {...annotation} onDelete={jest.fn()} />);

        expect(wrapper.find('InlineDelete').length).toEqual(0);
    });

    test('should not allow user to delete if onDelete handler is undefined', () => {
        const annotation = {
            created_at: TIME_STRING_SEPT_27_2017,
            message: 'test',
            created_by: USER
        };

        const wrapper = shallow(<Annotation id='123' {...annotation} />);

        expect(wrapper.find('InlineDelete').length).toEqual(0);
    });

    test('should render an error when one is defined', () => {
        const annotation = {
            created_at: TIME_STRING_SEPT_27_2017,
            message: 'test',
            created_by: USER
        };

        const wrapper = shallow(
            <Annotation
                id='123'
                {...annotation}
                onDelete={jest.fn()}
                error={{
                    title: 'error',
                    message: 'errorrrrr'
                }}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render an error cta when an action is defined', () => {
        const annotation = {
            created_at: TIME_STRING_SEPT_27_2017,
            message: 'test',
            created_by: USER
        };
        const onActionSpy = jest.fn();

        const wrapper = mount(
            <Annotation
                id='123'
                {...annotation}
                onDelete={jest.fn()}
                error={{
                    title: 'error',
                    message: 'errorrrrr',
                    action: {
                        text: 'click',
                        onAction: onActionSpy
                    }
                }}
            />
        );
        const inlineErrorActionLink = wrapper.find('InlineError').find('PlainButton.lnk');
        expect(inlineErrorActionLink.length).toEqual(1);

        inlineErrorActionLink.simulate('click');

        expect(onActionSpy).toHaveBeenCalledTimes(1);
    });
});
