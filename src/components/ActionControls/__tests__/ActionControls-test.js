import * as React from 'react';
import { shallow } from 'enzyme';

import ActionControls from '../ActionControls';

const fn = jest.fn();

describe('components/ActionControls', () => {
    const render = (props = {}) =>
        shallow(
            <ActionControls
                isPending={false}
                canDelete={false}
                onCreate={fn}
                onCommentClick={fn}
                onDelete={fn}
                onCancel={fn}
                {...props}
            />
        );

    test('should correctly render controls for plain highlight annotations without delete permissions', () => {
        const wrapper = render({ type: 'highlight' });
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly render controls for plain highlight annotations', () => {
        const wrapper = render({ canDelete: true, type: 'highlight' });
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly render controls for highlight comment annotations without delete permissions', () => {
        const wrapper = render({ type: 'highlight-comment' });
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly render controls for highlight comment annotations', () => {
        const wrapper = render({ canDelete: true, type: 'highlight-comment' });
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly render controls for pending highlight comment annotations', () => {
        const wrapper = render({ isPending: true, type: 'highlight-comment' });
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly render controls for drawing annotations', () => {
        const wrapper = render({ type: 'draw' });
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly render controls for point annotations', () => {
        const wrapper = render({ type: 'point' });
        expect(wrapper).toMatchSnapshot();
    });
});
