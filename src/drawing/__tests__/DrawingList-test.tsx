import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DrawingTarget from '../DrawingTarget';
import DrawingList from '../DrawingList';
import useOutsideEvent from '../../common/useOutsideEvent';
import { AnnotationDrawing } from '../../@types';
import { annotations } from '../__mocks__/data';
import { getShape } from '../drawingUtil';

jest.mock('../../common/useOutsideEvent', () => jest.fn((name, ref, cb) => cb()));

describe('DrawingList', () => {
    const defaults = {
        annotations: annotations as AnnotationDrawing[],
        onSelect: jest.fn(),
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<DrawingList {...defaults} {...props} />);
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
            const wrapper = getWrapper({ annotations: defaults.annotations.concat(invalid) });
            const children = wrapper.find(DrawingTarget);

            expect(children.length).toEqual(defaults.annotations.length);
        });

        test('should render the specified annotation based on activeId', () => {
            const wrapper = getWrapper({ activeId: 'anno_1' });
            const children = wrapper.find(DrawingTarget);

            expect(children.get(0).props.isActive).toBe(false);
            expect(children.get(1).props.isActive).toBe(true); // anno_1
        });

        test('should render annotations by largest to smallest shape', () => {
            const wrapper = getWrapper();
            const children = wrapper.find(DrawingTarget);

            const { height: height0, width: width0 } = getShape(annotations[0].target.path_groups);
            const { height: height1, width: width1 } = getShape(annotations[1].target.path_groups);

            const [larger, smaller] =
                height0 * width0 > height1 * width1 ? annotations : [annotations[1], annotations[0]];

            expect(children.get(0).props.target).toBe(larger.target);
            expect(children.get(1).props.target).toBe(smaller.target);
        });
    });
});
