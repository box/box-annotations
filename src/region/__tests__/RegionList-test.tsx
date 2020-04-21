import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import RegionAnnotation from '../RegionAnnotation';
import RegionList from '../RegionList';
import { AnnotationRegion } from '../../@types';

describe('RegionList', () => {
    const defaults = {
        activeId: 'anno_1',
        annotations: [
            { id: 'anno_1', target: { shape: { height: 20, width: 20 } } },
            { id: 'anno_2', target: { shape: { height: 50, width: 50 } } },
            { id: 'anno_3', target: { shape: { height: 10, width: 10 } } },
            { id: 'anno_4', target: { shape: { height: 100, width: 100 } } },
        ] as AnnotationRegion[],
        scale: 1,
    };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<RegionList {...defaults} {...props} />);

    describe('render', () => {
        test('should render the specified annotation based on activeId', () => {
            const wrapper = getWrapper({ activeId: 'anno_1' });
            const children = wrapper.find(RegionAnnotation);

            defaults.annotations.forEach((annotation, i) => {
                expect(children.get(i).props.isActive).toBe(annotation.id === 'anno_1');
            });
        });

        test('should render annotations by largest to smallest shape', () => {
            const wrapper = getWrapper();
            const children = wrapper.find(RegionAnnotation);

            expect(children.get(0).props.shape).toMatchObject({ height: 100, width: 100 });
            expect(children.get(1).props.shape).toMatchObject({ height: 50, width: 50 });
            expect(children.get(2).props.shape).toMatchObject({ height: 20, width: 20 });
            expect(children.get(3).props.shape).toMatchObject({ height: 10, width: 10 });
        });
    });
});
