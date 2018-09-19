import * as React from 'react';
import { shallow } from 'enzyme';

import DrawingControls from '../DrawingControls';

const IS_TRUE = true;
const onDelete = jest.fn();

describe('components/ActionControls/DrawingControls', () => {
    test('should correctly render the drawing controls', () => {
        const wrapper = shallow(<DrawingControls canDelete={IS_TRUE} onDelete={onDelete} />);
        expect(wrapper).toMatchSnapshot();
    });

    test('should not render the drawing delete button if the user does not have appropriate permissions', () => {
        const wrapper = shallow(<DrawingControls onDelete={onDelete} />);
        expect(wrapper).toMatchSnapshot();
    });
});
