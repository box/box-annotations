import * as React from 'react';
import { shallow } from 'enzyme';

import AnnotationForm from '../AnnotationForm';

const onCreate = jest.fn();
const onCancel = jest.fn();

describe('components/AnnotationForm', () => {
    test('should correctly render a list of annotation', () => {
        const wrapper = shallow(<AnnotationForm onCreate={onCreate} onCancel={onCancel} />).dive();
        expect(wrapper).toMatchSnapshot();
    });
});
