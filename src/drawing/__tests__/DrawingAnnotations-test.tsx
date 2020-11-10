import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingAnnotations, { Props } from '../DrawingAnnotations';
import DrawingList from '../DrawingList';
import { annotations } from '../__mocks__/drawingData';

jest.mock('../DrawingList');

describe('DrawingAnnotations', () => {
    const getDefaults = (): Props => ({
        activeAnnotationId: null,
        annotations: [],
        isCurrentFileVersion: true,
        setActiveAnnotationId: jest.fn(),
    });
    const getWrapper = (props = {}): ShallowWrapper => shallow(<DrawingAnnotations {...getDefaults()} {...props} />);

    describe('event handlers', () => {
        describe('handleAnnotationActive()', () => {
            test('should call setActiveAnnotationId with annotation id', () => {
                const setActiveAnnotationId = jest.fn();
                getWrapper({ setActiveAnnotationId })
                    .find(DrawingList)
                    .prop('onSelect')!('123');

                expect(setActiveAnnotationId).toHaveBeenCalledWith('123');
            });
        });
    });

    describe('render()', () => {
        test('should render DrawingList with passed props', () => {
            const wrapper = getWrapper({ annotations, activeAnnotationId: '123' });
            const list = wrapper.find(DrawingList);

            expect(list.hasClass('ba-DrawingAnnotations-list')).toBe(true);
            expect(list.prop('activeId')).toBe('123');
            expect(list.prop('annotations').length).toBe(annotations.length);
        });
    });
});
