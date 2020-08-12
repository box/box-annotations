import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightPromoter from '../HighlightPromoter';
import useOutsideEvent from '../../common/useOutsideEvent';

jest.mock('../../common/useOutsideEvent');

jest.useFakeTimers();

describe('HighlightPromoter', () => {
    const defaults = {
        pageEl: document.createElement('div'),
    };
    const isSelectingRef = { current: false };
    const timerRef = { current: null };
    const getWrapper = (props = {}): ShallowWrapper => shallow(<HighlightPromoter {...defaults} {...props} />);
    let removeEventListeners: void | (() => void | undefined);

    beforeEach(() => {
        jest.spyOn(React, 'useEffect').mockImplementation(func => {
            removeEventListeners = func();
        });
        jest.spyOn(React, 'useRef').mockImplementationOnce(() => isSelectingRef);
        jest.spyOn(React, 'useRef').mockImplementationOnce(() => timerRef);
    });

    afterEach(() => {
        isSelectingRef.current = false;
        timerRef.current = null;
        if (removeEventListeners) {
            removeEventListeners();
        }
    });

    describe('event handlers', () => {
        test('should add event listeners', () => {
            jest.spyOn(defaults.pageEl, 'addEventListener');

            getWrapper();

            expect(defaults.pageEl.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
            expect(defaults.pageEl.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
        });

        test('should call set isSelecting true when mousedown', () => {
            getWrapper();

            defaults.pageEl.dispatchEvent(new MouseEvent('mousedown', { buttons: 1 }));

            expect(isSelectingRef.current).toBe(true);
        });

        test('should set isSelecting and timer when mouseup', () => {
            isSelectingRef.current = true;
            getWrapper();

            defaults.pageEl.dispatchEvent(new MouseEvent('mouseup'));

            expect(timerRef.current).not.toBe(null);

            jest.runAllTimers();

            expect(isSelectingRef.current).toBe(false);
            expect(timerRef.current).toBe(null);
        });
    });

    describe('render', () => {
        test('should call useOutsideEvent', () => {
            getWrapper();

            expect(useOutsideEvent).toHaveBeenCalled();
        });
    });
});
