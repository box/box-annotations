import React from 'react';
import noop from 'lodash/noop';
import { act } from 'react-dom/test-utils';
import { mount, ReactWrapper } from 'enzyme';
import HighlightCanvas, { CanvasShape } from '../HighlightCanvas';
import HighlightSvg from '../HighlightSvg';
import HighlightTarget from '../HighlightTarget';
import { AnnotationHighlight } from '../../@types';
import { HighlightListComponent as HighlightList, Props } from '../HighlightList';

jest.mock('../HighlightCanvas');
jest.mock('../HighlightTarget');

describe('HighlightList', () => {
    const defaults: Props = {
        annotations: [
            { id: 'anno_1', target: { shapes: [{ height: 20, width: 20, x: 0, y: 0 }] } },
            { id: 'anno_2', target: { shapes: [{ height: 50, width: 50, x: 0, y: 0 }] } },
            { id: 'anno_3', target: { shapes: [{ height: 10, width: 10, x: 0, y: 0 }] } },
            { id: 'anno_4', target: { shapes: [{ height: 60, width: 60, x: 0, y: 0 }] } },
        ] as AnnotationHighlight[],
        onSelect: jest.fn(),
    };
    const getWrapper = (props?: Partial<Props>): ReactWrapper => mount(<HighlightList {...defaults} {...props} />);

    describe('render()', () => {
        test('should render HighlightCanvas, HighlightSvg and HighlightTarget', () => {
            const wrapper = getWrapper();

            expect(wrapper.find(HighlightCanvas).exists()).toBe(true);
            expect(wrapper.find(HighlightSvg).hasClass('is-listening')).toBe(true);
            expect(wrapper.find(HighlightTarget).exists()).toBe(true);
        });

        test('should not have is-listening class if isListening state is false', async () => {
            const wrapper = getWrapper();
            act(() => {
                document.dispatchEvent(new MouseEvent('mousedown'));
            });
            wrapper.update();
            expect(wrapper.find(HighlightSvg).hasClass('is-listening')).toBe(false);
        });

        test('should filter all invalid annotations', () => {
            const invalid = [
                { id: 'anno_5', target: { shapes: [{ height: 105, width: 0, x: 0, y: 0 }] } },
                { id: 'anno_6', target: { shapes: [{ height: 0, width: 105, x: 0, y: 0 }] } },
                { id: 'anno_7', target: { shapes: [{ height: 0, width: 0, x: 105, y: 0 }] } },
                { id: 'anno_8', target: { shapes: [{ height: 0, width: 0, x: 0, y: 105 }] } },
                { id: 'anno_9', target: { shapes: [{ height: -5, width: 0, x: 0, y: 0 }] } },
                { id: 'anno_10', target: { shapes: [{ height: 0, width: -5, x: 0, y: 0 }] } },
                { id: 'anno_11', target: { shapes: [{ height: 0, width: 0, x: -5, y: 0 }] } },
                { id: 'anno_12', target: { shapes: [{ height: 0, width: 0, x: 0, y: -5 }] } },
            ] as AnnotationHighlight[];
            const wrapper = getWrapper({ annotations: defaults.annotations.concat(invalid) });
            const children = wrapper.find(HighlightTarget);

            expect(children.length).toEqual(defaults.annotations.length);
        });

        test('should render canvas shapes reflecting the active id', () => {
            const wrapper = getWrapper({ activeId: 'anno_1' });
            const shapes = wrapper.find(HighlightCanvas).prop('shapes') as CanvasShape[];

            expect(shapes[0].isActive).toBe(false);
            expect(shapes[1].isActive).toBe(false);
            expect(shapes[2].isActive).toBe(true); // anno_1
            expect(shapes[3].isActive).toBe(false);
        });

        test('should render annotations by largest to smallest shape', () => {
            const wrapper = getWrapper();
            const children = wrapper.find(HighlightTarget);

            expect(children.get(0).props.shapes).toMatchObject([{ height: 60, width: 60 }]);
            expect(children.get(1).props.shapes).toMatchObject([{ height: 50, width: 50 }]);
            expect(children.get(2).props.shapes).toMatchObject([{ height: 20, width: 20 }]);
            expect(children.get(3).props.shapes).toMatchObject([{ height: 10, width: 10 }]);
        });

        test('should render canvas shapes reflecting the hover id', () => {
            const wrapper = getWrapper();
            let shapes = wrapper.find(HighlightCanvas).prop('shapes') as CanvasShape[];

            expect(shapes[0].isHover).toBe(false);
            expect(shapes[1].isHover).toBe(false);
            expect(shapes[2].isHover).toBe(false); // anno_1
            expect(shapes[3].isHover).toBe(false);

            act(() => {
                const target = wrapper.find(HighlightTarget).at(2);
                const handleTargetHover = target.prop('onHover') || noop;
                handleTargetHover('anno_1');
            });

            wrapper.update();

            shapes = wrapper.find(HighlightCanvas).prop('shapes') as CanvasShape[];

            expect(shapes[0].isHover).toBe(false);
            expect(shapes[1].isHover).toBe(false);
            expect(shapes[2].isHover).toBe(true); // anno_1
            expect(shapes[3].isHover).toBe(false);
        });
    });
});
