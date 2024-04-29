import React from 'react';
import noop from 'lodash/noop';
import { shallow, ShallowWrapper } from 'enzyme';
import { mockEvent } from '../../../common/__mocks__/events';
import { PointerCaptureBase as PointerCapture, Props, Status } from '../PointerCapture';

describe('PointerCapture', () => {
    const getDefaults = (): Props => ({
        onDrawStart: jest.fn(),
        onDrawStop: jest.fn(),
        onDrawUpdate: jest.fn(),
        onMouseOut: jest.fn(),
        onMouseOver: jest.fn(),
        status: Status.init,
    });

    const getWrapper = (props = {}): ShallowWrapper => shallow(<PointerCapture {...getDefaults()} {...props} />);

    beforeEach(() => {
        jest.spyOn(React, 'useEffect').mockImplementation(noop);
    });

    describe('render', () => {
        test('should render with default props', () => {
            const wrapper = getWrapper();

            expect(wrapper.find('div').props()).toMatchObject({
                onClick: expect.any(Function),
                onMouseDown: expect.any(Function),
                onMouseOut: expect.any(Function),
                onMouseOver: expect.any(Function),
                onTouchCancel: expect.any(Function),
                onTouchEnd: expect.any(Function),
                onTouchMove: expect.any(Function),
                onTouchStart: expect.any(Function),
                role: 'presentation',
            });
        });

        test('should render with provided props', () => {
            const wrapper = getWrapper({ children: <span className="child" />, className: 'foo', 'data-bar': 'bar' });

            expect(wrapper.props()).toMatchObject({
                className: 'foo',
                'data-bar': 'bar',
                onClick: expect.any(Function),
                onMouseDown: expect.any(Function),
                onMouseOut: expect.any(Function),
                onMouseOver: expect.any(Function),
                onTouchCancel: expect.any(Function),
                onTouchEnd: expect.any(Function),
                onTouchMove: expect.any(Function),
                onTouchStart: expect.any(Function),
                role: 'presentation',
            });
            expect(wrapper.find('.child').exists()).toBe(true);
        });
    });

    describe('eventing', () => {
        const mockMouseEvent = {
            ...mockEvent,
            button: 0,
        };

        const mockTouchEvent = {
            ...mockEvent,
            targetTouches: [
                {
                    clientX: 1,
                    clientY: 2,
                },
            ],
        };

        test('should suppress click event', () => {
            const wrapper = getWrapper();

            wrapper.find('div').simulate('click', mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        test('should not invoke onDrawStart if mousedown event is not the primary button', () => {
            const onDrawStart = jest.fn();
            const wrapper = getWrapper({ onDrawStart });
            const event = { ...mockEvent, button: 1 };

            wrapper.find('div').simulate('mousedown', event);

            expect(onDrawStart).not.toHaveBeenCalled();
        });

        test.each`
            type             | event             | callback
            ${'mousedown'}   | ${mockMouseEvent} | ${'onDrawStart'}
            ${'touchstart'}  | ${mockTouchEvent} | ${'onDrawStart'}
            ${'touchcancel'} | ${mockTouchEvent} | ${'onDrawStop'}
            ${'touchend'}    | ${mockTouchEvent} | ${'onDrawStop'}
            ${'touchmove'}   | ${mockTouchEvent} | ${'onDrawUpdate'}
            ${'mouseout'}    | ${mockMouseEvent} | ${'onMouseOut'}
            ${'mouseover'}   | ${mockMouseEvent} | ${'onMouseOver'}
        `('should invoke $callback when $type occurs', ({ type, event, callback }) => {
            const mockCallback = jest.fn();
            const wrapper = getWrapper({ [callback]: mockCallback });

            wrapper.find('div').simulate(type, event);

            expect(mockCallback).toHaveBeenCalled();
        });

        describe('effects', () => {
            beforeEach(() => {
                jest.spyOn(React, 'useEffect').mockImplementation(f => f());
            });

            test('should not call onDrawUpdate if mousemove on document and status is init', () => {
                const onDrawUpdate = jest.fn();
                getWrapper({ onDrawUpdate, status: Status.init });

                document.dispatchEvent(
                    new MouseEvent('mousemove', {
                        ...mockMouseEvent,
                        clientX: 10,
                        clientY: 10,
                    }),
                );
                expect(onDrawUpdate).not.toHaveBeenCalled();
            });

            test('should not call onDrawUpdate if mousemove on document is not primary button', () => {
                const onDrawUpdate = jest.fn();
                getWrapper({ onDrawUpdate, status: Status.dragging });

                document.dispatchEvent(
                    new MouseEvent('mousemove', {
                        ...mockMouseEvent,
                        button: 1,
                        clientX: 10,
                        clientY: 10,
                    }),
                );
                expect(onDrawUpdate).not.toHaveBeenCalled();
            });

            test('should call onDrawUpdate if mousemove occurs on document', () => {
                const onDrawUpdate = jest.fn();
                getWrapper({ onDrawUpdate, status: Status.drawing });

                document.dispatchEvent(
                    new MouseEvent('mousemove', {
                        ...mockMouseEvent,
                        button: 0,
                        clientX: 10,
                        clientY: 10,
                    }),
                );
                expect(onDrawUpdate).toHaveBeenCalledWith(10, 10);
            });

            test('should call onDrawStop if mouseup occurs on document', () => {
                const onDrawStop = jest.fn();
                getWrapper({ onDrawStop, status: Status.dragging });

                document.dispatchEvent(new MouseEvent('mouseup', mockMouseEvent));

                expect(onDrawStop).toHaveBeenCalled();
            });
        });
    });
});
