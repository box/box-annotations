import * as React from 'react';
import { shallow } from 'enzyme';

import AnnotatorLabel from '../AnnotatorLabel';

const createdBy = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov'
};

describe('components/AnnotationPopover/AnnotatorLabel', () => {
    const render = (props = {}) => shallow(<AnnotatorLabel id='123' {...props} />);

    test('should render nothign if label is pending', () => {
        const wrapper = render({ isPending: true }).dive();
        expect(wrapper).toMatchSnapshot();
    });

    test('should render a highlight annotation label', () => {
        const wrapper = render({
            type: 'highlight',
            createdBy
        }).dive();
        expect(wrapper).toMatchSnapshot();
    });

    test('should render a drawing annotation label', () => {
        const wrapper = render({
            type: 'draw',
            createdBy
        }).dive();
        expect(wrapper).toMatchSnapshot();
    });

    test('should render an anonymous highlight annotation label', () => {
        const wrapper = render({
            type: 'highlight'
        }).dive();
        expect(wrapper).toMatchSnapshot();
    });

    test('should render an anonymous drawing annotation label', () => {
        const wrapper = render({
            type: 'draw'
        }).dive();
        expect(wrapper).toMatchSnapshot();
    });
});
