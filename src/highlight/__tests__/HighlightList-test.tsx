import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightCanvas, { CanvasShape } from '../HighlightCanvas';
import HighlightList, { Props } from '../HighlightList';
import HighlightSvg from '../HighlightSvg';
import HighlightTarget from '../HighlightTarget';
import useOutsideEvent from '../../common/useOutsideEvent';
import { AnnotationHighlight } from '../../@types';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));

jest.mock('../../common/useOutsideEvent', () => jest.fn((name, ref, cb) => cb()));

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
    const getWrapper = (props?: Partial<Props>): ShallowWrapper => shallow(<HighlightList {...defaults} {...props} />);

    describe('render()', () => {
        const mockSetHoverAnnotationId = jest.fn();
        const mockSetIsListening = jest.fn();
        const setupMocks = ({
            isListening = true,
            hoverAnnotationId = null,
        }: { isListening?: boolean; hoverAnnotationId?: string | null } = {}): void => {
            jest.spyOn(React, 'useState')
                .mockImplementationOnce(() => [isListening, mockSetIsListening])
                .mockImplementationOnce(() => [hoverAnnotationId, mockSetHoverAnnotationId]);
        };

        test('should render HighlightSvg and HighlightAnnotation', () => {
            setupMocks();
            const wrapper = getWrapper();

            expect(wrapper.find(HighlightSvg).hasClass('is-listening')).toBe(true);
            expect(wrapper.find(HighlightTarget).exists()).toBe(true);
        });

        test('should not have is-listening class if isListening state is false', () => {
            setupMocks({ isListening: false });

            const wrapper = getWrapper();

            expect(wrapper.find(HighlightSvg).hasClass('is-listening')).toBe(false);
        });

        test('should call useOutsideEvent', () => {
            setupMocks();
            getWrapper();

            expect(mockSetIsListening).toHaveBeenNthCalledWith(1, false); // mousedown
            expect(mockSetIsListening).toHaveBeenNthCalledWith(2, true); // mouseup
            expect(useOutsideEvent).toHaveBeenCalledTimes(2);
        });

        test('should filter all invalid annotations', () => {
            setupMocks();
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
            setupMocks();
            const wrapper = getWrapper({ activeId: 'anno_1' });
            const shapes = wrapper.find(HighlightCanvas).prop('shapes') as CanvasShape[];

            expect(shapes[0].isActive).toBe(false);
            expect(shapes[1].isActive).toBe(false);
            expect(shapes[2].isActive).toBe(true); // anno_1
            expect(shapes[3].isActive).toBe(false);
        });

        test('should render annotations by largest to smallest shape', () => {
            setupMocks();
            const wrapper = getWrapper();
            const children = wrapper.find(HighlightTarget);

            expect(children.get(0).props.shapes).toMatchObject([{ height: 60, width: 60 }]);
            expect(children.get(1).props.shapes).toMatchObject([{ height: 50, width: 50 }]);
            expect(children.get(2).props.shapes).toMatchObject([{ height: 20, width: 20 }]);
            expect(children.get(3).props.shapes).toMatchObject([{ height: 10, width: 10 }]);
        });

        test('should render canvas shapes reflecting the hover id', () => {
            setupMocks({ hoverAnnotationId: 'anno_1' });

            const wrapper = getWrapper();
            const shapes = wrapper.find(HighlightCanvas).prop('shapes') as CanvasShape[];

            expect(shapes[0].isHover).toBe(false);
            expect(shapes[1].isHover).toBe(false);
            expect(shapes[2].isHover).toBe(true); // anno_1
            expect(shapes[3].isHover).toBe(false);
        });

        test('should setHoverAnnotationId if onHover is triggered', () => {
            setupMocks();

            const wrapper = getWrapper();
            const highlightTarget = wrapper.find(HighlightTarget).at(0);
            highlightTarget.simulate('hover', 'anno_1');

            expect(mockSetHoverAnnotationId).toBeCalledWith('anno_1');
        });
    });
});
