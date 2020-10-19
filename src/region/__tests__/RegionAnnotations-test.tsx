import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import RegionAnnotations from '../RegionAnnotations';
import RegionList from '../RegionList';
import { annotations } from '../__mocks__/data';

jest.mock('../RegionList');

describe('RegionAnnotations', () => {
    const defaults = {
        activeAnnotationId: null,
        annotations: [],
        setActiveAnnotationId: jest.fn(),
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionAnnotations {...defaults} {...props} />);

    describe('event handlers', () => {
        describe('handleAnnotationActive()', () => {
            test('should call setActiveAnnotationId with annotation id', () => {
                getWrapper()
                    .find(RegionList)
                    .prop('onSelect')!('123');

                expect(defaults.setActiveAnnotationId).toHaveBeenCalledWith('123');
            });
        });
    });

    describe('render()', () => {
        test('should render one RegionAnnotation per annotation', () => {
            const wrapper = getWrapper({ annotations });
            const list = wrapper.find(RegionList);

            expect(list.hasClass('ba-RegionAnnotations-list')).toBe(true);
            expect(list.prop('annotations').length).toBe(annotations.length);
        });

        test('should pass activeId to the region list', () => {
            const wrapper = getWrapper({ activeAnnotationId: '123' });

            expect(wrapper.find(RegionList).prop('activeId')).toBe('123');
        });
    });
});
