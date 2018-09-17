import * as React from 'react';
import { shallow } from 'enzyme';

import AnnotationList from '../AnnotationList';

const TIME_STRING_SEPT_27_2017 = '2017-09-27T10:40:41-07:00';

const USER = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov'
};

const annotations = [
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

const onDelete = () => console.log('deleted');

describe('components/AnnotationList', () => {
    test('should correctly render a list of annotation', () => {
        const wrapper = shallow(<AnnotationList annotations={annotations} onDelete={onDelete} />).dive();
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.ba-annotation-list-item').length).toEqual(2);
    });
});
