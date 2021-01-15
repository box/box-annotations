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
});
