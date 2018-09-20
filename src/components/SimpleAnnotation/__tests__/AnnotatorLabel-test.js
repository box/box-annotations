import * as React from 'react';
import { shallow } from 'enzyme';

import AnnotatorLabel from '../AnnotatorLabel';

const USER = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov'
};

describe('components/SimpleAnnotation/AnnotatorLabel', () => {
    const render = (props = {}) => shallow(<AnnotatorLabel id='123' {...props} />);

    test('should render a highlight annotation label', () => {
        const wrapper = render({
            type: 'highlight',
            currentUser: USER
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should render a drawing annotation label', () => {
        const wrapper = render({
            type: 'draw',
            currentUser: USER
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should render an anonymous highlight annotation label', () => {
        const wrapper = render({
            type: 'highlight'
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should render an anonymous drawing annotation label', () => {
        const wrapper = render({
            type: 'draw'
        });
        expect(wrapper).toMatchSnapshot();
    });
});