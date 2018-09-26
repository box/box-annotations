import * as React from 'react';
import { shallow } from 'enzyme';

import DrawingControls from '../DrawingControls';

const onDelete = jest.fn();

describe('components/ActionControls/DrawingControls', () => {
    test('should correctly render the drawing controls', () => {
        const wrapper = shallow(<DrawingControls canAnnotate={false} canDelete={true} onDelete={onDelete} />);
        expect(wrapper).toMatchSnapshot();
    });

    test('should not render the drawing delete button if the user does not have appropriate permissions', () => {
        const wrapper = shallow(<DrawingControls onDelete={onDelete} />);
        expect(wrapper).toMatchSnapshot();
    });
});
