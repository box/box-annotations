import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { CreatorItem, CreatorStatus } from '../../store';
import { annotations } from '../__mocks__/data';
import RegionAnnotation from '../RegionAnnotation';
import RegionAnnotations from '../RegionAnnotations';

describe('RegionAnnotations', () => {
    const defaults = {
        page: 1,
        saveAnnotation: jest.fn(),
        setStaged: jest.fn(),
        setStatus: jest.fn(),
        staged: {} as CreatorItem,
        status: CreatorStatus.init,
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionAnnotations {...defaults} {...props} />);

    describe('scaleShape()', () => {
        test('should format the underlying shape based on scale', () => {
            const wrapper = getWrapper({ scale: 2 });
            const instance = wrapper.instance() as InstanceType<typeof RegionAnnotations>;
            const shape = instance.scaleShape({
                type: 'rect',
                height: 50,
                width: 50,
                x: 10,
                y: 10,
            });

            expect(shape).toMatchObject({
                type: 'rect',
                height: 100,
                width: 100,
                x: 20,
                y: 20,
            });
        });
    });

    describe('render()', () => {
        test('should render one RegionAnnotation per annotation', () => {
            const wrapper = getWrapper({ annotations });

            expect(wrapper.exists('.ba-RegionAnnotations-list')).toBe(true);
            expect(wrapper.find(RegionAnnotation).length).toBe(3);
        });
    });
});
