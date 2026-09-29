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
    const getButton = (props = {}): ShallowWrapper => getWrapper(props).find('button');

    beforeEach(() => {
        jest.spyOn(ReactRedux, 'useSelector').mockImplementation(() => true);
    });

    describe('mouse event handlers', () => {
        test('should select the annotation on focus', () => {
            const wrapper = getButton();

            wrapper.simulate('focus', mockEvent);

            expect(defaults.onSelect).toHaveBeenCalledWith(defaults.annotationId);
        });

        test('should focus the button on mousedown', () => {
            const button = { focus: jest.fn() };
            const event = { buttons: 1, currentTarget: button, ...mockEvent };
            const wrapper = getButton();

            wrapper.simulate('mousedown', event);

            expect(button.focus).toHaveBeenCalled();
            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
        });
    });

    describe('render()', () => {
        test('should render the class name based on the isActive prop', () => {
            expect(getButton().hasClass('ba-RegionAnnotation')).toBe(true);
            expect(getButton({ isActive: true }).hasClass('is-active')).toBe(true);
            expect(getButton({ isActive: false }).hasClass('is-active')).toBe(false);
        });

        test('should render a RegionRect and pass it the provided shape', () => {
            const wrapper = getButton();

            expect(wrapper.prop('style')).toMatchObject({
                display: 'block',
                height: '10%',
                left: '10%',
                top: '10%',
                width: '10%',
            });
        });

        test('should pass the required props to the underlying anchor', () => {
            const wrapper = getButton({ className: 'ba-Test' });

            expect(wrapper.props()).toMatchObject({
                className: 'ba-RegionAnnotation ba-Test',
                onFocus: expect.any(Function),
                onMouseDown: expect.any(Function),
                type: 'button',
            });
        });

        test('should pass a noop method for onClick if not defined', () => {
            const wrapper = getButton({ onSelect: undefined });

            expect(wrapper.props()).toMatchObject({
                className: 'ba-RegionAnnotation',
                onFocus: expect.any(Function),
                onMouseDown: expect.any(Function),
                type: 'button',
            });
        });

        test('shoud render resin tags', () => {
            const wrapper = getButton();

            expect(wrapper.props()).toMatchObject({
                'data-resin-itemid': defaults.annotationId,
                'data-resin-target': 'highlightRegion',
            });
        });

        test('should name the button for assistive technology', () => {
            const wrapper = getWrapper();

            expect(getButton().prop('aria-label')).toBe('Region Annotation Inline Comment');
            expect(getButton().prop('aria-describedby')).toBeUndefined();
            expect(wrapper.find('.ba-RegionAnnotation-commentText').exists()).toBe(false);
        });

        test('should describe the button with the comment text', () => {
            const wrapper = getWrapper({ commentMessage: 'Hello @[42:Ada Lovelace]' });
            const description = wrapper.find('.ba-RegionAnnotation-commentText');

            expect(getButton({ commentMessage: 'Hello @[42:Ada Lovelace]' }).prop('aria-describedby')).toBe(
                'ba-annotation-comment-1',
            );
            expect(description.prop('id')).toBe('ba-annotation-comment-1');
            expect(description.text()).toBe('Hello Ada Lovelace');
        });
    });
});
