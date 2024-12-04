import * as React from 'react';
import * as ReactRedux from 'react-redux';
import { shallow, ShallowWrapper } from 'enzyme';
import RegionAnnotation from '../RegionAnnotation';
import { mockEvent } from '../../common/__mocks__/events';
import { rect } from '../__mocks__/data';

// Mock the entire react-redux module
jest.mock('react-redux', () => ({
    __esModule: true,
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn(),
}));

describe('RegionAnnotation', () => {
    const defaults = {
        annotationId: '1',
        isActive: false,
        onSelect: jest.fn(),
        shape: rect,
    };
    const getWrapper = (props = {}): ShallowWrapper => {
        return shallow(<RegionAnnotation {...defaults} {...props} />);
    };

    beforeEach(() => {
        jest.spyOn(ReactRedux, 'useSelector').mockImplementation(() => true);
    });

    describe('mouse event handlers', () => {
        test('should select the annotation on focus', () => {
            const wrapper = getWrapper();

            wrapper.simulate('focus', mockEvent);

            expect(defaults.onSelect).toHaveBeenCalledWith(defaults.annotationId);
        });

        test('should focus the button on mousedown', () => {
            const button = { focus: jest.fn() };
            const event = { buttons: 1, currentTarget: button, ...mockEvent };
            const wrapper = getWrapper();

            wrapper.simulate('mousedown', event);

            expect(button.focus).toHaveBeenCalled();
            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
        });
    });

    describe('render()', () => {
        test('should render the class name based on the isActive prop', () => {
            expect(getWrapper().hasClass('ba-RegionAnnotation')).toBe(true);
            expect(getWrapper({ isActive: true }).hasClass('is-active')).toBe(true);
            expect(getWrapper({ isActive: false }).hasClass('is-active')).toBe(false);
        });

        test('should render a RegionRect and pass it the provided shape', () => {
            const wrapper = getWrapper();

            expect(wrapper.prop('style')).toMatchObject({
                display: 'block',
                height: '10%',
                left: '10%',
                top: '10%',
                width: '10%',
            });
        });

        test('should pass the required props to the underlying anchor', () => {
            const wrapper = getWrapper({ className: 'ba-Test' });

            expect(wrapper.props()).toMatchObject({
                className: 'ba-RegionAnnotation ba-Test',
                onFocus: expect.any(Function),
                onMouseDown: expect.any(Function),
                type: 'button',
            });
        });

        test('should pass a noop method for onClick if not defined', () => {
            const wrapper = getWrapper({ onSelect: undefined });

            expect(wrapper.props()).toMatchObject({
                className: 'ba-RegionAnnotation',
                onFocus: expect.any(Function),
                onMouseDown: expect.any(Function),
                type: 'button',
            });
        });

        test('shoud render resin tags', () => {
            const wrapper = getWrapper();

            expect(wrapper.props()).toMatchObject({
                'data-resin-itemid': defaults.annotationId,
                'data-resin-target': 'highlightRegion',
            });
        });
    });
});
