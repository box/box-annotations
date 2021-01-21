import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import DrawingTarget from '../DrawingTarget';
import DrawingList, { Props } from '../DrawingList';
import DrawingSVG from '../DrawingSVG';
import useIsListInteractive from '../../common/useIsListInteractive';
import { AnnotationDrawing } from '../../@types';
import { annotations } from '../__mocks__/drawingData';

jest.mock('../../common/useIsListInteractive');

describe('DrawingList', () => {
    const getDefaults = (): Props => ({
        annotations: annotations as AnnotationDrawing[],
    });
    const getWrapper = (props = {}): ReactWrapper => mount(<DrawingList {...getDefaults()} {...props} />);

    beforeEach(() => {
        jest.spyOn(React, 'useState').mockImplementation(() => [null, jest.fn()]);
    });

    describe('render', () => {
        test.each([
            { className: 'is-listening', isListening: true },
            { className: '', isListening: false },
        ])('should render the class based on isListening $isListening', ({ className, isListening }) => {
            (useIsListInteractive as jest.Mock).mockReturnValue(isListening);

            const wrapper = getWrapper();

            expect(wrapper.find(DrawingSVG).prop('className')).toBe(className);
        });

        test('should filter all invalid annotations', () => {
            const invalid = [
                { id: 'anno_3', target: { path_groups: [{ paths: [{ points: [{ x: 105, y: 0 }] }] }] } },
                { id: 'anno_4', target: { path_groups: [{ paths: [{ points: [{ x: 0, y: 105 }] }] }] } },
                { id: 'anno_5', target: { path_groups: [{ paths: [{ points: [{ x: -5, y: 0 }] }] }] } },
                { id: 'anno_6', target: { path_groups: [{ paths: [{ points: [{ x: 0, y: -5 }] }] }] } },
            ] as AnnotationDrawing[];
            const { annotations: mockAnnotations } = getDefaults();
            const wrapper = getWrapper({ annotations: mockAnnotations.concat(invalid) });
            const children = wrapper.find(DrawingTarget);

            expect(children.length).toEqual(mockAnnotations.length);
        });

        test('should render the specified annotation based on activeId', () => {
            const wrapper = getWrapper({ activeId: 'drawing_anno_1' });
            const children = wrapper.find(DrawingTarget);

            expect(children.get(0).props.isActive).toBe(false);
            expect(children.get(1).props.isActive).toBe(true); // anno_1
        });

        test('should render annotations by largest to smallest shape', () => {
            const wrapper = getWrapper();
            const children = wrapper.find(DrawingTarget);

            // annotations[1] has a larger area, so renders first
            expect(children.get(0).props.target).toBe(annotations[1].target);
            expect(children.get(1).props.target).toBe(annotations[0].target);
        });
    });

    describe('useEffect', () => {
        const rootEl = { style: { display: 'block ' } };
        const userAgentStr =
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2';

        beforeEach(() => {
            jest.useFakeTimers();
            jest.spyOn(React, 'useState').mockImplementation(() => [rootEl, jest.fn()]);
        });

        test.each`
            browser     | userAgent                            | expected   | should
            ${'Safari'} | ${`${userAgentStr} Safari/605.1.15`} | ${'none'}  | ${'should set display to none'}
            ${'Chrome'} | ${userAgentStr}                      | ${'block'} | ${'should not set display to none'}
        `('$should when rootEl and activeId are defined and browser is $browser', ({ expected, userAgent }) => {
            global.window.navigator.userAgent = userAgent;

            getWrapper({ activeId: 'drawing_anno_1' });

            expect(rootEl.style.display).toBe(expected);

            jest.runAllTimers();

            expect(rootEl.style.display).toBe('block');
        });
    });
});
