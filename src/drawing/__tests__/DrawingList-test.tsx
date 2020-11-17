import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingTarget from '../DrawingTarget';
import DrawingList, { Props } from '../DrawingList';
import useOutsideEvent from '../../common/useOutsideEvent';
import { AnnotationDrawing } from '../../@types';
import { annotations } from '../__mocks__/drawingData';

jest.mock('../../common/useOutsideEvent', () => jest.fn((name, ref, cb) => cb()));

describe('DrawingList', () => {
    const getDefaults = (): Props => ({
        annotations: annotations as AnnotationDrawing[],
    });
    const getWrapper = (props = {}): ShallowWrapper => shallow(<DrawingList {...getDefaults()} {...props} />);
    const setIsListeningValue: { current: unknown } = { current: null };
    const setIsListening = jest.fn((value: unknown): void => {
        setIsListeningValue.current = value;
    });

    beforeEach(() => {
        setIsListeningValue.current = null; // Reset the mocked state

        jest.spyOn(React, 'useState').mockImplementation(() => [setIsListeningValue.current, setIsListening]);
    });

    describe('event handlers', () => {
        test('should call setIsListening and onSelect based on outside mouse events', () => {
            const onSelect = jest.fn();

            getWrapper({ onSelect });

            expect(onSelect).toHaveBeenCalledWith(null); // mousedown
            expect(setIsListening).toHaveBeenNthCalledWith(1, false); // mousedown
            expect(setIsListening).toHaveBeenNthCalledWith(2, true); // mouseup
            expect(useOutsideEvent).toHaveBeenCalledTimes(2);
        });
    });

    describe('render', () => {
        test.each([true, false])('should render the class based on isListening %s', isListening => {
            setIsListening(isListening);

            const wrapper = getWrapper();

            expect(wrapper.hasClass('is-listening')).toBe(isListening);
        });

        test('should filter all invalid annotations', () => {
            const invalid = [
                { id: 'anno_3', target: { path_groups: [{ paths: [{ points: [{ x: 105, y: 0 }] }] }] } },
                { id: 'anno_4', target: { path_groups: [{ paths: [{ points: [{ x: 0, y: 105 }] }] }] } },
                { id: 'anno_5', target: { path_groups: [{ paths: [{ points: [{ x: -5, y: 0 }] }] }] } },
                { id: 'anno_6', target: { path_groups: [{ paths: [{ points: [{ x: 0, y: -5 }] }] }] } },
            ] as AnnotationDrawing[];
            const { annotations: mockAnnotations } = getDefaults();
            const wrapper = getWrapper({ annotations: mockAnnotations.concat(invalid) });
            const children = wrapper.find(DrawingTarget);

            expect(children.length).toEqual(mockAnnotations.length);
        });

        test('should render the specified annotation based on activeId', () => {
            const wrapper = getWrapper({ activeId: 'drawing_anno_1' });
            const children = wrapper.find(DrawingTarget);

            expect(children.get(0).props.isActive).toBe(false);
            expect(children.get(1).props.isActive).toBe(true); // anno_1
        });

        test('should render annotations by largest to smallest shape', () => {
            const wrapper = getWrapper();
            const children = wrapper.find(DrawingTarget);

            // annotations[1] has a larger area, so renders first
            expect(children.get(0).props.target).toBe(annotations[1].target);
            expect(children.get(1).props.target).toBe(annotations[0].target);
        });
    });
});
