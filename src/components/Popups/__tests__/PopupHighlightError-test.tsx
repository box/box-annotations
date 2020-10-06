import React from 'react';
import { FormattedMessage } from 'react-intl';
import { shallow, ShallowWrapper } from 'enzyme';
import PopupBase from '../PopupBase';
import PopupHighlightError from '../PopupHighlightError';
import useOutsideEvent from '../../../common/useOutsideEvent';

jest.mock('../../../common/useOutsideEvent');

describe('PopupHighlightError', () => {
    const defaults = {
        onCancel: jest.fn(),
        shape: {
            height: 10,
            width: 0,
            x: 200,
            y: 200,
        },
    };

    const getWrapper = (props = {}): ShallowWrapper => shallow(<PopupHighlightError {...defaults} {...props} />);

    const divRef = React.createRef();

    beforeEach(() => {
        jest.spyOn(React, 'useRef').mockImplementationOnce(() => ({
            current: {
                popupRef: divRef,
            },
        }));
    });

    describe('event handlers', () => {
        test('should call onCancel', () => {
            getWrapper();

            expect(defaults.onCancel).toHaveBeenCalled();
            expect(useOutsideEvent).toHaveBeenCalledWith('mousedown', divRef, defaults.onCancel);
        });
    });

    describe('render()', () => {
        test('should render correct rect and message', () => {
            const wrapper = getWrapper();

            const newVirtualElement = wrapper.find(PopupBase).prop('reference');
            const rect = newVirtualElement.getBoundingClientRect();

            expect(rect.height).toEqual(10);
            expect(rect.width).toEqual(0);
            expect(rect.left).toEqual(200);
            expect(rect.top).toEqual(200);

            expect(wrapper.find(FormattedMessage).prop('id')).toBe('ba.popups.popupHighlight.restrictedPrompt');
        });
    });
});
