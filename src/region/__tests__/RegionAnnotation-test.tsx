import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { rect } from '../__mocks__/data';
import AnnotationTarget from '../../components/AnnotationTarget';
import RegionAnnotation from '../RegionAnnotation';
import RegionRect from '../RegionRect';

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

    describe('render()', () => {
        test('should render the class name based on the isActive prop', () => {
            expect(getWrapper().hasClass('ba-RegionAnnotation')).toBe(true);
            expect(getWrapper({ isActive: true }).hasClass('is-active')).toBe(true);
            expect(getWrapper({ isActive: false }).hasClass('is-active')).toBe(false);
        });

        test('should render a RegionRect and pass it the provided shape', () => {
            const wrapper = getWrapper();

            expect(wrapper.find(RegionRect).prop('shape')).toMatchInlineSnapshot(`
                Object {
                  "height": 10,
                  "type": "rect",
                  "width": 10,
                  "x": 10,
                  "y": 10,
                }
            `);
        });

        test('should render an AnnotationTarget with the correct props', () => {
            const onSelect = jest.fn();
            const wrapper = getWrapper({
                annotationId: 'abc',
                className: 'test',
                onSelect,
            });

            expect(wrapper.find(AnnotationTarget).props()).toMatchObject({
                annotationId: 'abc',
                className: 'test',
                onSelect,
            });
        });
    });
});
