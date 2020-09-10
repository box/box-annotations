import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import PopupBase from '../PopupBase';
import PopupHighlight from '../PopupHighlight';

describe('PopupHighlight', () => {
    const defaults = {
        onClick: jest.fn(),
        shape: {
            height: 10,
            width: 100,
            x: 200,
            y: 200,
        },
    };

    const getWrapper = (props = {}): ShallowWrapper => shallow(<PopupHighlight {...defaults} {...props} />);

    const buttonEl = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    };

    beforeEach(() => {
        jest.spyOn(React, 'useRef').mockImplementationOnce(() => ({
            current: buttonEl,
        }));
    });

    describe('mouse events', () => {
        test('should call onClick', () => {
            const wrapper = getWrapper();

            const mouseEvent = new MouseEvent('click');
            wrapper.find('[data-testid="ba-PopupHighlight-button"]').simulate('click', mouseEvent);

            expect(defaults.onClick).toHaveBeenCalledWith(mouseEvent);
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
