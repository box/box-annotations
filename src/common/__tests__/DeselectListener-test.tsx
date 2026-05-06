import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import DeselectListener from '../DeselectListener';
import { setActiveAnnotationIdAction } from '../../store/annotations/actions';

jest.mock('react-redux', () => ({
    useDispatch: () => jest.fn(),
}));
jest.mock('../../store/annotations/actions');

describe('DeselectListener', () => {
    const getWrapper = (): ShallowWrapper => shallow(<DeselectListener />);

    beforeEach(() => {
        jest.spyOn(React, 'useEffect').mockImplementation(f => f());
        jest.spyOn(document, 'addEventListener');
    });

    test('mousedown', () => {
        const wrapper = getWrapper();

        document.dispatchEvent(new MouseEvent('mousedown'));

        expect(wrapper.isEmptyRender()).toBe(true);
        expect(document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(setActiveAnnotationIdAction).toHaveBeenCalledWith(null);
    });

    test('should not deselect when mousedown originates inside a portaled popup', () => {
        getWrapper();

        const popup = document.createElement('div');
        popup.className = 'ba-PopupV2';
        const inner = document.createElement('button');
        popup.appendChild(inner);
        document.body.appendChild(popup);

        inner.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(setActiveAnnotationIdAction).not.toHaveBeenCalled();

        document.body.removeChild(popup);
    });
});
