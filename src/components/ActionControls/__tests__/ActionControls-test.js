import * as React from 'react';
import { shallow } from 'enzyme';

import ActionControls from '../ActionControls';

const IS_TRUE = true;
const onDelete = jest.fn();
const onCreate = jest.fn();
const onCommentClick = jest.fn();

describe('components/ActionControls', () => {
    const render = (props = {}) =>
        shallow(
            <ActionControls
                canAnnotate={IS_TRUE}
                canDelete={IS_TRUE}
                onCreate={onCreate}
                onCommentClick={onCommentClick}
                onDelete={onDelete}
                {...props}
            />
        );

    test('should correctly render controls for drawing annotations', () => {
        const wrapper = render({ type: 'draw' });
        expect(wrapper).toMatchSnapshot();
    });

    test('should not render controls for plain highlight annotations', () => {
        const wrapper = render({ type: 'highlight' });
        expect(wrapper).toMatchSnapshot();
    });

    test('should not render controls for highlight comment annotations', () => {
        const wrapper = render({ type: 'highlight-comment' });
        expect(wrapper).toMatchSnapshot();
    });
});
