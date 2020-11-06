import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingAnnotations from '../DrawingAnnotations';
import DrawingList from '../DrawingList';
import { annotations } from '../__mocks__/data';

jest.mock('../DrawingList');

describe('DrawingAnnotations', () => {
    const defaults = {
        activeAnnotationId: null,
        annotations: [],
        isCurrentFileVersion: true,
        setActiveAnnotationId: jest.fn(),
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<DrawingAnnotations {...defaults} {...props} />);

    describe('event handlers', () => {
        describe('handleAnnotationActive()', () => {
            test('should call setActiveAnnotationId with annotation id', () => {
                getWrapper()
                    .find(DrawingList)
                    .prop('onSelect')!('123');

                expect(defaults.setActiveAnnotationId).toHaveBeenCalledWith('123');
            });
        });
    });

    describe('render()', () => {
        test('should render one DrawingAnnotation per annotation', () => {
            const wrapper = getWrapper({ annotations });
            const list = wrapper.find(DrawingList);

            expect(list.hasClass('ba-DrawingAnnotations-list')).toBe(true);
            expect(list.prop('annotations').length).toBe(annotations.length);
        });

        test('should pass activeId to the drawing list', () => {
            const wrapper = getWrapper({ activeAnnotationId: '123' });

            expect(wrapper.find(DrawingList).prop('activeId')).toBe('123');
        });
    });
});
