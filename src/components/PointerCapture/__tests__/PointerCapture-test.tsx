import React from 'react';
import noop from 'lodash/noop';
import { shallow, ShallowWrapper } from 'enzyme';
import PointerCapture, { Props, Status } from '../PointerCapture';

describe('PointerCapture', () => {
    const defaults: Props = {
        onDrawStart: jest.fn(),
        onDrawStop: jest.fn(),
        onDrawUpdate: jest.fn(),
        onMouseOut: jest.fn(),
        onMouseOver: jest.fn(),
        status: Status.init,
    };

    type CallbackTypes = keyof Props;

    const getWrapper = (props = {}): ShallowWrapper => shallow(<PointerCapture {...defaults} {...props} />);

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

            expect(wrapper.find('div').props()).toMatchObject({
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
            expect(wrapper.find('span.child').exists()).toBe(true);
        });
    });

    describe('eventing', () => {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        const getEvent = () => ({
            buttons: 1,
            currentTarget: {
                focus: jest.fn(),
            },
            preventDefault: jest.fn(),
            nativeEvent: {
                stopImmediatePropagation: jest.fn(),
            },
            stopPropagation: jest.fn(),
        });

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        const getTouchEvent = () => ({
            ...getEvent(),
            targetTouches: [
                {
                    clientX: 1,
                    clientY: 2,
                },
            ],
        });

        test('should suppress click event', () => {
            const wrapper = getWrapper();
            const event = getEvent();

            wrapper.find('div').simulate('click', event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
            expect(event.nativeEvent.stopImmediatePropagation).toHaveBeenCalled();
        });

        test('should not invoke onDrawStart if mousedown event is not the primary button', () => {
            const wrapper = getWrapper();
            const event = { ...getEvent(), buttons: 2 };

            wrapper.find('div').simulate('mousedown', event);

            expect(defaults.onDrawStart).not.toHaveBeenCalled();
        });

        test.each`
            type             | event              | callback
            ${'mousedown'}   | ${getEvent()}      | ${'onDrawStart'}
            ${'touchstart'}  | ${getTouchEvent()} | ${'onDrawStart'}
            ${'touchcancel'} | ${getEvent()}      | ${'onDrawStop'}
            ${'touchend'}    | ${getEvent()}      | ${'onDrawStop'}
            ${'touchmove'}   | ${getTouchEvent()} | ${'onDrawUpdate'}
            ${'mouseout'}    | ${getEvent()}      | ${'onMouseOut'}
            ${'mouseover'}   | ${getEvent()}      | ${'onMouseOver'}
        `('should invoke $callback when $type occurs', ({ type, event, callback }) => {
            const wrapper = getWrapper();

            wrapper.find('div').simulate(type, event);

            expect(defaults[callback as CallbackTypes]).toHaveBeenCalled();
        });

        describe('effects', () => {
            beforeEach(() => {
                jest.spyOn(React, 'useEffect').mockImplementation(f => f());
            });

            test('should not call onDrawUpdate if mousemove on document and status is init', () => {
                getWrapper({ status: Status.init });

                document.dispatchEvent(
                    new MouseEvent('mousemove', {
                        ...getEvent(),
                        clientX: 10,
                        clientY: 10,
                    }),
                );
                expect(defaults.onDrawUpdate).not.toHaveBeenCalled();
            });

            test('should not call onDrawUpdate if mousemove on document is not primary button', () => {
                getWrapper({ status: Status.dragging });

                document.dispatchEvent(
                    new MouseEvent('mousemove', {
                        ...getEvent(),
                        buttons: 2,
                        clientX: 10,
                        clientY: 10,
                    }),
                );
                expect(defaults.onDrawUpdate).not.toHaveBeenCalled();
            });

            test('should call onDrawUpdate if mousemove occurs on document', () => {
                getWrapper({ status: Status.drawing });

                document.dispatchEvent(
                    new MouseEvent('mousemove', {
                        ...getEvent(),
                        clientX: 10,
                        clientY: 10,
                    }),
                );
                expect(defaults.onDrawUpdate).toHaveBeenCalledWith(10, 10);
            });

            test('should call onDrawStop if mouseup occurs on document', () => {
                getWrapper({ status: Status.dragging });

                document.dispatchEvent(
                    new MouseEvent('mouseup', {
                        ...getEvent(),
                    }),
                );

                expect(defaults.onDrawStop).toHaveBeenCalled();
            });
        });
    });
});
