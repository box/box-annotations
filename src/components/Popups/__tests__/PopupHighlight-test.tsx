import React, { act } from 'react';
import { mount, ReactWrapper } from 'enzyme';
import PopupBase from '../PopupBase';
import PopupHighlight from '../PopupHighlight';

jest.mock('../PopupBase');

describe('PopupHighlight', () => {
    const getWrapper = (props = {}): ReactWrapper =>
        mount(
            <PopupHighlight
                onCancel={jest.fn()}
                onSubmit={jest.fn()}
                shape={{
                    height: 10,
                    width: 100,
                    x: 200,
                    y: 200,
                }}
                {...props}
            />,
        );

    const buttonRef = React.createRef();

    beforeEach(() => {
        jest.spyOn(React, 'useRef').mockImplementationOnce(() => buttonRef);
    });

    describe('event handlers', () => {
        test('should handle outside mousedown events', () => {
            const onCancel = jest.fn();
            const wrapper = getWrapper({ onCancel });

            act(() => {
                document.dispatchEvent(new MouseEvent('mousedown'));
            });
            wrapper.update();

            expect(onCancel).toBeCalled();
        });

        test('should handle outside keydown events', () => {
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            const wrapper = getWrapper();

            jest.spyOn(event, 'preventDefault');
            jest.spyOn(event, 'stopPropagation');

            act(() => {
                document.dispatchEvent(event);
            });
            wrapper.update();

            expect(event.preventDefault).toBeCalled();
            expect(event.stopPropagation).toBeCalled();
        });
    });

    describe('mouse events', () => {
        test('should call onClick', () => {
            const onSubmit = jest.fn();
            const wrapper = getWrapper({ onSubmit });

            wrapper.find('[data-testid="ba-PopupHighlight-button"]').simulate('click');

            expect(onSubmit).toBeCalled();
        });
    });

    describe('render()', () => {
        test('should render correct rect', () => {
            const wrapper = getWrapper();

            const newVirtualElement = wrapper.find(PopupBase).prop('reference');
            const rect = newVirtualElement.getBoundingClientRect();

            expect(rect.height).toEqual(10);
            expect(rect.width).toEqual(100);
            expect(rect.left).toEqual(200);
            expect(rect.top).toEqual(200);
        });
    });
});
