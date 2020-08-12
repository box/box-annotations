import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightAnnotations from '../HighlightAnnotations';
import HighlightCreator from '../HighlightCreator';
import HighlightPromoter from '../HighlightPromoter';
import { HighlightList } from '../HighlightList';

jest.mock('../HighlightCreator');

describe('HighlightAnnotations', () => {
    const defaults = {
        activeAnnotationId: null,
        isCreating: false,
        pageEl: document.createElement('div'),
        setActiveAnnotationId: jest.fn(),
    };

    const getWrapper = (props = {}): ShallowWrapper<{}, {}, HighlightAnnotations> =>
        shallow(<HighlightAnnotations {...defaults} {...props} />);

    describe('render()', () => {
        test('should render a RegionCreator if in creation mode', () => {
            const wrapper = getWrapper({ isCreating: true });

            expect(wrapper.exists(HighlightList)).toBe(true);
            expect(wrapper.exists(HighlightCreator)).toBe(true);
            expect(wrapper.exists(HighlightPromoter)).toBe(false);
        });

        test('should not render creation components if not in creation mode', () => {
            const wrapper = getWrapper({ isCreating: false });

            expect(wrapper.exists(HighlightList)).toBe(true);
            expect(wrapper.exists(HighlightCreator)).toBe(false);
            expect(wrapper.exists(HighlightPromoter)).toBe(true);
        });
    });

    describe('handleAnnotationActive()', () => {
        test('should call setActiveAnnotationId', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();

            instance.handleAnnotationActive('123');

            expect(defaults.setActiveAnnotationId).toHaveBeenCalledWith('123');
        });
    });
});
