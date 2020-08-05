import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightAnnotations from '../HighlightAnnotations';
import HighlightCreator from '../HighlightCreator';

jest.mock('../HighlightCreator');

describe('components/highlight/HighlightAnnotations', () => {
    const defaults = {
        activeAnnotationId: null,
        isCreating: false,
        setActiveAnnotationId: jest.fn(),
    };

    const getWrapper = (props = {}): ShallowWrapper => shallow(<HighlightAnnotations {...defaults} {...props} />);

    describe('render()', () => {
        test('should render a RegionCreator if in creation mode', () => {
            const wrapper = getWrapper({ isCreating: true });
            const creator = wrapper.find(HighlightCreator);

            expect(creator.hasClass('ba-HighlightAnnotations-creator')).toBe(true);
        });

        test('should not render creation components if not in creation mode', () => {
            const wrapper = getWrapper({ isCreating: false });

            expect(wrapper.exists(HighlightCreator)).toBe(false);
        });
    });
});
