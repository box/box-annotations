import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import RegionAnnotation from '../RegionAnnotation';
import RegionList from '../RegionList';
import useOutsideEvent from '../../common/useOutsideEvent';
import { AnnotationRegion } from '../../@types';

jest.mock('../../common/useOutsideEvent', () => jest.fn((name, ref, cb) => cb()));

describe('RegionList', () => {
    const defaults = {
        annotations: [
            { id: 'anno_1', target: { shape: { height: 20, width: 20, x: 0, y: 0 } } },
            { id: 'anno_2', target: { shape: { height: 50, width: 50, x: 0, y: 0 } } },
            { id: 'anno_3', target: { shape: { height: 10, width: 10, x: 0, y: 0 } } },
            { id: 'anno_4', target: { shape: { height: 60, width: 60, x: 0, y: 0 } } },
        ] as AnnotationRegion[],
        onSelect: jest.fn(),
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionList {...defaults} {...props} />);
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

            expect(onSelect).toHaveBeenCalledWith(null); // click
            expect(setIsListening).toHaveBeenNthCalledWith(1, false); // mousedown
            expect(setIsListening).toHaveBeenNthCalledWith(2, true); // mouseup
            expect(useOutsideEvent).toHaveBeenCalledTimes(3);
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
                { id: 'anno_5', target: { shape: { height: 105, width: 0, x: 0, y: 0 } } },
                { id: 'anno_6', target: { shape: { height: 0, width: 105, x: 0, y: 0 } } },
                { id: 'anno_7', target: { shape: { height: 0, width: 0, x: 105, y: 0 } } },
                { id: 'anno_8', target: { shape: { height: 0, width: 0, x: 0, y: 105 } } },
                { id: 'anno_9', target: { shape: { height: -5, width: 0, x: 0, y: 0 } } },
                { id: 'anno_10', target: { shape: { height: 0, width: -5, x: 0, y: 0 } } },
                { id: 'anno_11', target: { shape: { height: 0, width: 0, x: -5, y: 0 } } },
                { id: 'anno_12', target: { shape: { height: 0, width: 0, x: 0, y: -5 } } },
            ] as AnnotationRegion[];
            const wrapper = getWrapper({ annotations: defaults.annotations.concat(invalid) });
            const children = wrapper.find(RegionAnnotation);

            expect(children.length).toEqual(defaults.annotations.length);
        });

        test('should render the specified annotation based on activeId', () => {
            const wrapper = getWrapper({ activeId: 'anno_1' });
            const children = wrapper.find(RegionAnnotation);

            expect(children.get(0).props.isActive).toBe(false);
            expect(children.get(1).props.isActive).toBe(false);
            expect(children.get(2).props.isActive).toBe(true); // anno_1
            expect(children.get(3).props.isActive).toBe(false);
        });

        test('should render annotations by largest to smallest shape', () => {
            const wrapper = getWrapper();
            const children = wrapper.find(RegionAnnotation);

            expect(children.get(0).props.shape).toMatchObject({ height: 60, width: 60 });
            expect(children.get(1).props.shape).toMatchObject({ height: 50, width: 50 });
            expect(children.get(2).props.shape).toMatchObject({ height: 20, width: 20 });
            expect(children.get(3).props.shape).toMatchObject({ height: 10, width: 10 });
        });
    });
});
