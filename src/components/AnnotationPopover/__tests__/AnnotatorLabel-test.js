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
    const render = (props = {}) => shallow(<AnnotatorLabel id='123' {...props} />).dive();

    test('should render nothing if label is pending', () => {
        const wrapper = render({ isPending: true });
        expect(wrapper).toMatchSnapshot();
    });

    test('should render a highlight annotation label', () => {
        const wrapper = render({
            type: 'highlight',
            createdBy
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should render a drawing annotation label', () => {
        const wrapper = render({
            type: 'draw',
            createdBy
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
