import * as React from 'react';
import { shallow } from 'enzyme';

import DrawingControls from '../DrawingControls';

const onDelete = jest.fn();

describe('components/ActionControls/DrawingControls', () => {
    test('should correctly render pending drawing controls', () => {
        const wrapper = shallow(<DrawingControls canDelete={true} isPending={true} onDelete={onDelete} />);
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly render saved drawing controls', () => {
        const wrapper = shallow(<DrawingControls canDelete={true} onDelete={onDelete} />);
        expect(wrapper).toMatchSnapshot();
    });
});
