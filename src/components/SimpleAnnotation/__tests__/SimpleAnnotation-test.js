import * as React from 'react';
import { shallow } from 'enzyme';

import SimpleAnnotation from '../SimpleAnnotation';

const onDelete = jest.fn();
const onCreate = jest.fn();
const onCommentClick = jest.fn();

const USER = {
    type: 'user',
    id: '789ghi',
    name: 'Mia Thermopolis',
    email: 'princess@genovia.gov'
};

describe('components/SimpleAnnotation', () => {
    const render = (props = {}) =>
        shallow(
            <SimpleAnnotation
                id='123'
                canAnnotate={true}
                canDelete={true}
                onCreate={onCreate}
                onCommentClick={onCommentClick}
                onDelete={onDelete}
                isPending={false}
                {...props}
            />
        );

    test('should correctly render a pending highlight dialog', () => {
        const wrapper = render({ type: 'highlight', isPending: true });
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly render a pending drawing dialog', () => {
        const wrapper = render({ type: 'draw', isPending: true });
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly render a highlight dialog', () => {
        const wrapper = render({ type: 'highlight', isPending: true });
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly render a drawing dialog', () => {
        const wrapper = render({ type: 'draw', isPending: true });
        expect(wrapper).toMatchSnapshot();
    });
});
