import * as React from 'react';
import { shallow } from 'enzyme';

import HighlightControls from '../HighlightControls';

const onCreate = jest.fn();
const onCommentClick = jest.fn();

describe('components/ActionControls/HighlightControls', () => {
    const render = (props = {}) =>
        shallow(<HighlightControls onCreate={onCreate} onCommentClick={onCommentClick} {...props} />);

    test('should correctly render the drawing controls', () => {
        const wrapper = render({
            canDelete: true,
            canAnnotate: true
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should not render the highlight button if the user cannot delete', () => {
        const wrapper = render({ canDelete: true });
        expect(wrapper).toMatchSnapshot();
    });

    test('should not render the highlight comment button if the user cannot annotate', () => {
        const wrapper = render({ canAnnotate: true });
        expect(wrapper).toMatchSnapshot();
    });
});
