import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightAnnotation from '../HighlightAnnotation';
import HighlightList, { Props } from '../HighlightList';
import useOutsideEvent from '../../common/useOutsideEvent';
import { annotation as mockAnnotation } from '../__mocks__/data';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));

jest.mock('../../common/useOutsideEvent', () => jest.fn((name, ref, cb) => cb()));

describe('highlight/HighlightList', () => {
    const defaults: Props = {
        annotations: [mockAnnotation],
        onSelect: jest.fn(),
    };
    const getWrapper = (props?: Partial<Props>): ShallowWrapper => shallow(<HighlightList {...defaults} {...props} />);

    describe('render()', () => {
        const mockSetIsListening = jest.fn();

        beforeEach(() => {
            jest.spyOn(React, 'useState').mockImplementation(() => [true, mockSetIsListening]);
        });

        test('should render svg and HighlightAnnotation', () => {
            const wrapper = getWrapper();

            expect(wrapper.find('svg').hasClass('is-listening')).toBe(true);
            expect(wrapper.find(HighlightAnnotation).exists()).toBe(true);
        });

        test('should not have is-listening class if isListening state is false', () => {
            jest.spyOn(React, 'useState').mockImplementationOnce(() => [false, mockSetIsListening]);

            const wrapper = getWrapper();

            expect(wrapper.find('svg').hasClass('is-listening')).toBe(false);
        });

        test('should call useOutsideEvent', () => {
            getWrapper();

            expect(mockSetIsListening).toHaveBeenNthCalledWith(1, false); // mousedown
            expect(mockSetIsListening).toHaveBeenNthCalledWith(2, true); // mouseup
            expect(useOutsideEvent).toHaveBeenCalledTimes(2);
        });
    });
});
