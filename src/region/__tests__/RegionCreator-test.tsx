import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { Rect } from '../../@types';
import { mockEvent } from '../__mocks__/events';
import RegionCreator from '../RegionCreator';

describe('RegionCreator', () => {
    const defaults = {
        canDraw: true,
        onDraw: jest.fn(),
        onStart: jest.fn(),
        onStop: jest.fn(),
    };
    const getDOMRect = (x: number, y: number, height: number, width: number): DOMRect => ({
        bottom: 0,
        top: y,
        left: x,
        right: 0,
        height,
        width,
        toJSON: jest.fn(),
        x,
        y,
    });
    const getInstance = (wrapper: ShallowWrapper): InstanceType<typeof RegionCreator> => {
        return wrapper.instance() as InstanceType<typeof RegionCreator>;
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionCreator {...defaults} {...props} />);

    describe('componentWillMount()', () => {
        const wrapper = getWrapper();
        const instance = getInstance(wrapper);
        const removeListeners = jest.spyOn(instance, 'removeListeners');

        wrapper.unmount();

        expect(removeListeners).toHaveBeenCalled();
    });

    describe('getPosition()', () => {
        test('should return the provided coordinate less the left/top position of the containing element', () => {
            const wrapper = getWrapper();
            const instance = getInstance(wrapper);
            const creatorRef = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            instance.creatorRef = { current: creatorRef };

            jest.spyOn(creatorRef, 'getBoundingClientRect').mockImplementation(() => getDOMRect(15, 15, 50, 50));

            expect(instance.getPosition(100, 100)).toEqual([85, 85]);
        });
    });

    describe('getShape()', () => {
        test.each`
            x1      | y1      | x2      | y2      | result                                       | comment
            ${-1}   | ${-1}   | ${10}   | ${10}   | ${{ height: 10, width: 10, x: 1, y: 1 }}     | ${'minimum position'}
            ${5}    | ${5}    | ${100}  | ${100}  | ${{ height: 95, width: 95, x: 5, y: 5 }}     | ${'standard dimensions'}
            ${50}   | ${50}   | ${100}  | ${100}  | ${{ height: 50, width: 50, x: 50, y: 50 }}   | ${'standard dimensions'}
            ${100}  | ${100}  | ${105}  | ${105}  | ${{ height: 10, width: 10, x: 100, y: 100 }} | ${'minimum size'}
            ${100}  | ${100}  | ${50}   | ${50}   | ${{ height: 50, width: 50, x: 50, y: 50 }}   | ${'standard dimensions'}
            ${1500} | ${1500} | ${50}   | ${50}   | ${{ height: 949, width: 949, x: 50, y: 50 }} | ${'maximum size'}
            ${1500} | ${1500} | ${1500} | ${1500} | ${{ height: 10, width: 10, x: 999, y: 999 }} | ${'maximum position'}
        `('should call return a rect based on current state with $comment', ({ result, x1, x2, y1, y2 }) => {
            const creatorRef = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            const wrapper = getWrapper();
            const instance = getInstance(wrapper);

            jest.spyOn(creatorRef, 'getBoundingClientRect').mockImplementation(() => getDOMRect(0, 0, 1000, 1000));

            wrapper.setState({ x1, x2, y1, y2 });
            instance.creatorRef = { current: creatorRef };

            expect(instance.getShape()).toMatchObject(result);
        });
    });

    describe('event handlers', () => {
        const wrapper = getWrapper();
        const instance = getInstance(wrapper);

        beforeEach(() => {
            instance.addListeners();
            instance.isDrawing = jest.fn().mockReturnValue(true);
            instance.startDraw = jest.fn();
            instance.stopDraw = jest.fn();
            instance.updateDraw = jest.fn();
        });

        afterEach(() => {
            instance.removeListeners();
        });

        describe('handleClick', () => {
            test('should cancel the click event', () => {
                wrapper.simulate('click', { ...mockEvent });

                expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(mockEvent.stopPropagation).toHaveBeenCalled();
            });
        });

        describe('handleMouseDown', () => {
            test.each`
                buttons | calls
                ${1}    | ${1}
                ${2}    | ${0}
                ${null} | ${0}
            `('should be handled based on the mouse button pressed: $buttons', ({ buttons, calls }) => {
                wrapper.simulate('mousedown', { ...mockEvent, buttons });

                expect(instance.startDraw).toHaveBeenCalledTimes(calls);
            });
        });

        describe('handleMouseMove', () => {
            test.each`
                buttons | calls
                ${1}    | ${1}
                ${2}    | ${0}
                ${null} | ${0}
            `('should be handled based on the mouse button pressed: $buttons', ({ buttons, calls }) => {
                document.dispatchEvent(new MouseEvent('mousemove', { ...mockEvent, buttons }));

                expect(instance.isDrawing).toHaveBeenCalledTimes(calls);
                expect(instance.updateDraw).toHaveBeenCalledTimes(calls);
            });

            test('should call updateDraw with the event payload', () => {
                document.dispatchEvent(
                    new MouseEvent('mousemove', {
                        ...mockEvent,
                        buttons: 1,
                        clientX: 50,
                        clientY: 50,
                    }),
                );

                expect(instance.updateDraw).toHaveBeenCalledWith(50, 50);
            });
        });

        describe('handleMouseUp', () => {
            test('should call stopDraw', () => {
                document.dispatchEvent(new MouseEvent('mouseup', { ...mockEvent, buttons: 1 }));

                expect(instance.stopDraw).toHaveBeenCalled();
            });
        });

        describe('handleTouchCancel', () => {
            test('should call stopDraw', () => {
                wrapper.simulate('touchcancel', { ...mockEvent });

                expect(instance.stopDraw).toHaveBeenCalled();
            });
        });

        describe('handleTouchEnd', () => {
            test('should call stopDraw', () => {
                wrapper.simulate('touchend', { ...mockEvent });

                expect(instance.stopDraw).toHaveBeenCalled();
            });
        });

        describe('handleTouchMove', () => {
            test('should call updateDraw with the event payload', () => {
                wrapper.simulate('touchmove', { ...mockEvent, targetTouches: [{ clientX: 50, clientY: 50 }] });

                expect(instance.updateDraw).toHaveBeenCalledWith(50, 50);
            });
        });

        describe('handleTouchStart', () => {
            test('should call startDraw with the event payload', () => {
                wrapper.simulate('touchstart', { ...mockEvent, targetTouches: [{ clientX: 50, clientY: 50 }] });

                expect(instance.startDraw).toHaveBeenCalledWith(50, 50);
            });
        });
    });

    describe('addListeners()', () => {
        test('should add document-level event listeners', () => {
            const addSpy = jest.spyOn(document, 'addEventListener');
            const wrapper = getWrapper();
            const instance = getInstance(wrapper);

            instance.addListeners();

            expect(addSpy).toHaveBeenNthCalledWith(1, 'mousemove', instance.handleMouseMove);
            expect(addSpy).toHaveBeenNthCalledWith(2, 'mouseup', instance.handleMouseUp);
        });
    });

    describe('removeListeners()', () => {
        test('should remove document-level event listeners', () => {
            const removeSpy = jest.spyOn(document, 'removeEventListener');
            const wrapper = getWrapper();
            const instance = getInstance(wrapper);

            instance.removeListeners();

            expect(removeSpy).toHaveBeenNthCalledWith(1, 'mousemove', instance.handleMouseMove);
            expect(removeSpy).toHaveBeenNthCalledWith(2, 'mouseup', instance.handleMouseUp);
        });
    });

    describe('isDrawing()', () => {
        test.each`
            x1      | y1      | result
            ${null} | ${null} | ${false}
            ${10}   | ${null} | ${false}
            ${null} | ${10}   | ${false}
            ${10}   | ${10}   | ${true}
        `('should return a boolean based on the current state', ({ result, x1, y1 }) => {
            const wrapper = getWrapper();
            const instance = getInstance(wrapper);

            wrapper.setState({ x1, y1 });

            expect(instance.isDrawing()).toBe(result);
        });
    });

    describe('startDraw()', () => {
        test('should set state based on the data provided', () => {
            const onStart = jest.fn();
            const wrapper = getWrapper({ onStart });
            const instance = getInstance(wrapper);
            const addListeners = jest.spyOn(instance, 'addListeners');

            instance.startDraw(10, 10);

            expect(addListeners).toHaveBeenCalled();
            expect(onStart).toHaveBeenCalled();
            expect(wrapper.state()).toMatchObject({
                x1: 10,
                y1: 10,
                x2: null,
                y2: null,
            });
        });
    });

    describe('stopDraw()', () => {
        test('should set state and invoke the onStop callback', () => {
            const onStop = jest.fn();
            const wrapper = getWrapper({ onStop });
            const instance = getInstance(wrapper);
            const removeListeners = jest.spyOn(instance, 'removeListeners');
            const shape = { height: 50, type: 'rect', width: 50, x: 50, y: 50 } as Rect;

            instance.getShape = jest.fn(() => shape);
            instance.stopDraw();

            expect(removeListeners).toHaveBeenCalled();
            expect(onStop).toHaveBeenCalledWith(shape);
            expect(wrapper.state()).toMatchObject({
                x1: null,
                y1: null,
                x2: null,
                y2: null,
            });
        });
    });

    describe('updateDraw()', () => {
        test('should set state with the new position', () => {
            const wrapper = getWrapper();
            const instance = getInstance(wrapper);

            instance.updateDraw(5, 5);

            expect(wrapper.state('x2')).toEqual(5);
            expect(wrapper.state('y2')).toEqual(5);
        });
    });

    describe('render()', () => {
        test('should add event listeners if canDraw is true', () => {
            const wrapper = getWrapper();

            expect(wrapper.prop('onClick')).toBeDefined();
            expect(wrapper.prop('onMouseDown')).toBeDefined();
            expect(wrapper.prop('onTouchCancel')).toBeDefined();
            expect(wrapper.prop('onTouchEnd')).toBeDefined();
            expect(wrapper.prop('onTouchMove')).toBeDefined();
            expect(wrapper.prop('onTouchStart')).toBeDefined();
        });

        test('should not add event listeners if canDraw is false', () => {
            const wrapper = getWrapper({ canDraw: false });

            expect(wrapper.prop('onClick')).not.toBeDefined();
            expect(wrapper.prop('onMouseDown')).not.toBeDefined();
            expect(wrapper.prop('onTouchCancel')).not.toBeDefined();
            expect(wrapper.prop('onTouchEnd')).not.toBeDefined();
            expect(wrapper.prop('onTouchMove')).not.toBeDefined();
            expect(wrapper.prop('onTouchStart')).not.toBeDefined();
        });

        test('should add is-active class if canDraw is true', () => {
            const wrapper = getWrapper({ canDraw: true });
            expect(wrapper.prop('className')).toEqual('ba-RegionCreator is-active');

            wrapper.setProps({ canDraw: false });
            expect(wrapper.prop('className')).toEqual('ba-RegionCreator');
        });
    });
});
