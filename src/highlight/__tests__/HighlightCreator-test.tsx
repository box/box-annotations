import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightCreator from '../HighlightCreator';

describe('HighlightCreator', () => {
    const getWrapper = (props = {}): ShallowWrapper => shallow(<HighlightCreator {...props} />);

    describe('render', () => {
        test('should add class', () => {
            const wrapper = getWrapper();

            expect(wrapper.hasClass('ba-HighlightCreator')).toBe(true);
        });
    });
});
