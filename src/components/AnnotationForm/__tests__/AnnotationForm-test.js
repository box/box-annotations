import * as React from 'react';
import { shallow } from 'enzyme';

import AnnotationForm from '../AnnotationForm';

const onCreate = ({ text }) => console.log(`created with '${text}'`);
const onCancel = () => console.log('canceled');

describe('components/AnnotationForm', () => {
    test('should correctly render a list of annotation', () => {
        const wrapper = shallow(<AnnotationForm onCreate={onCreate} onCancel={onCancel} />).dive();
        expect(wrapper).toMatchSnapshot();
    });
});
