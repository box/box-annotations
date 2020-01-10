import * as React from 'react';
import { shallow } from 'enzyme';

import HighlightControls from '../HighlightControls';

const onCreate = jest.fn();
const onCommentClick = jest.fn();

describe('components/ActionControls/HighlightControls', () => {
    const render = (props = {}) =>
        shallow(<HighlightControls onCommentClick={onCommentClick} onCreate={onCreate} {...props} />);

    test('should correctly render pending plain highlight controls', () => {
        const wrapper = render({
            canAnnotateAndDelete: true,
            canComment: false,
            isPending: true,
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly render pending highlight comment controls', () => {
        const wrapper = render({
            canAnnotateAndDelete: true,
            canComment: true,
            isPending: true,
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly render saved plain highlight controls', () => {
        const wrapper = render({
            canAnnotateAndDelete: true,
            canComment: false,
        });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.ba-saved-highlight').length).toEqual(1);
    });

    test('should correctly render saved highlight comment controls', () => {
        const wrapper = render({
            canAnnotateAndDelete: true,
            canComment: true,
        });
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.ba-saved-highlight').length).toEqual(1);
    });
});
