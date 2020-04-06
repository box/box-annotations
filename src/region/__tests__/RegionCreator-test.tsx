import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { mockEvent } from '../__mocks__/events';
import RegionCreator from '../RegionCreator';

describe('RegionCreator', () => {
    const DOMRect = (x: number, y: number, height: number, width: number): DOMRect => ({
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
    const defaults = {
        canDraw: true,
        onDone: jest.fn(),
        onDraw: jest.fn(),
    };
    const getInstance = (wrapper: ShallowWrapper): InstanceType<typeof RegionCreator> => {
        return wrapper.instance() as InstanceType<typeof RegionCreator>;
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionCreator {...defaults} {...props} />);

    describe('componentDidMount()', () => {
        test('should add document-level event listeners', () => {
            const addSpy = jest.spyOn(document, 'addEventListener');
            const wrapper = getWrapper();
            const instance = getInstance(wrapper);

            expect(addSpy).toHaveBeenNthCalledWith(1, 'mousemove', instance.handleMouseMove);
            expect(addSpy).toHaveBeenNthCalledWith(2, 'mouseup', instance.handleMouseUp);
        });
    });

    describe('componentWillUnmount()', () => {
        test('should remove document-level event listeners', () => {
            const removeSpy = jest.spyOn(document, 'removeEventListener');
            const wrapper = getWrapper();
            const instance = getInstance(wrapper);

            wrapper.unmount();

            expect(removeSpy).toHaveBeenNthCalledWith(1, 'mousemove', instance.handleMouseMove);
            expect(removeSpy).toHaveBeenNthCalledWith(2, 'mouseup', instance.handleMouseUp);
        });
    });

    describe('getPosition()', () => {
        test('should return the provided coordinate less the left/top position of the containing element', () => {
            const wrapper = getWrapper();
            const instance = getInstance(wrapper);
            const creatorRef = document.createElement('div');

            instance.creatorRef = { current: creatorRef };

            jest.spyOn(creatorRef as HTMLDivElement, 'getBoundingClientRect').mockImplementation(() =>
                DOMRect(15, 15, 50, 50),
            );

            expect(instance.getPosition({ x: 100, y: 100 })).toEqual({ x: 85, y: 85 });
        });
    });

    describe('event handlers', () => {
        const wrapper = getWrapper();
        const instance = getInstance(wrapper);

        beforeEach(() => {
            instance.startDraw = jest.fn();
            instance.stopDraw = jest.fn();
            instance.updateDraw = jest.fn();
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
                buttons | isDrawing | calls
                ${1}    | ${true}   | ${1}
                ${1}    | ${false}  | ${0}
                ${2}    | ${true}   | ${0}
                ${2}    | ${false}  | ${0}
            `('should be handled based on the mouse button pressed: $buttons', ({ buttons, isDrawing, calls }) => {
                wrapper.setState({ isDrawing });

                document.dispatchEvent(new MouseEvent('mousemove', { ...mockEvent, buttons }));

                expect(instance.updateDraw).toHaveBeenCalledTimes(calls);
            });

            test('should call updateDraw with the event payload', () => {
                wrapper.setState({ isDrawing: true });

                document.dispatchEvent(
                    new MouseEvent('mousemove', {
                        ...mockEvent,
                        buttons: 1,
                        clientX: 50,
                        clientY: 50,
                    }),
                );

                expect(instance.updateDraw).toHaveBeenCalledWith({ x: 50, y: 50 });
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

                expect(instance.updateDraw).toHaveBeenCalledWith({ x: 50, y: 50 });
            });
        });

        describe('handleTouchStart', () => {
            test('should call startDraw with the event payload', () => {
                wrapper.simulate('touchstart', { ...mockEvent, targetTouches: [{ clientX: 50, clientY: 50 }] });

                expect(instance.startDraw).toHaveBeenCalledWith({ x: 50, y: 50 });
            });
        });
    });

    describe('startDraw()', () => {
        test('should set state based on the data provided', () => {
            const wrapper = getWrapper();
            const instance = getInstance(wrapper);

            instance.startDraw({ x: 10, y: 10 });

            expect(wrapper.state()).toMatchObject({
                isDrawing: true,
                position: { x: 10, y: 10 },
            });
        });
    });

    describe('stopDraw', () => {
        test('should set state and invoke the onDone callback', () => {
            const onDone = jest.fn();
            const wrapper = getWrapper({ onDone });
            const instance = getInstance(wrapper);

            instance.stopDraw();

            expect(onDone).toHaveBeenCalled();
            expect(wrapper.state()).toMatchObject({
                isDrawing: false,
            });
        });
    });

    describe('updateDraw', () => {
        test.each`
            position1               | position2               | height | width  | x      | y      | comment
            ${{ x: -1, y: -1 }}     | ${{ x: 10, y: 10 }}     | ${10}  | ${10}  | ${1}   | ${1}   | ${'minimum position'}
            ${{ x: 5, y: 5 }}       | ${{ x: 100, y: 100 }}   | ${95}  | ${95}  | ${5}   | ${5}   | ${'standard dimensions'}
            ${{ x: 50, y: 50 }}     | ${{ x: 100, y: 100 }}   | ${50}  | ${50}  | ${50}  | ${50}  | ${'standard dimensions'}
            ${{ x: 100, y: 100 }}   | ${{ x: 105, y: 105 }}   | ${10}  | ${10}  | ${100} | ${100} | ${'minimum size'}
            ${{ x: 100, y: 100 }}   | ${{ x: 50, y: 50 }}     | ${50}  | ${50}  | ${50}  | ${50}  | ${'standard dimensions'}
            ${{ x: 1500, y: 1500 }} | ${{ x: 50, y: 50 }}     | ${949} | ${949} | ${50}  | ${50}  | ${'maximum size'}
            ${{ x: 1500, y: 1500 }} | ${{ x: 1500, y: 1500 }} | ${10}  | ${10}  | ${999} | ${999} | ${'maximum position'}
        `('should call onDraw with the final rect with $comment', params => {
            const { position1, position2, height, width, x, y } = params;
            const creatorRef = document.createElement('div');
            const onDraw = jest.fn();
            const wrapper = getWrapper({ onDraw });
            const instance = getInstance(wrapper);

            jest.spyOn(creatorRef as HTMLDivElement, 'getBoundingClientRect').mockImplementation(() =>
                DOMRect(0, 0, 1000, 1000),
            );

            wrapper.setState({ position: position1 });
            instance.creatorRef = { current: creatorRef };
            instance.updateDraw(position2);

            expect(onDraw).toHaveBeenCalledWith({
                height,
                width,
                x,
                y,
            });
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
    });
});
