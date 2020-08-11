import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HighlightPromoter from '../HighlightPromoter';
// import { isInRect } from '../highlightUtil';

jest.mock('../highlightUtil', () => ({
    isInRect: jest.fn(() => true),
    getSelectionRange: jest.fn(),
}));

jest.useFakeTimers();

describe('HighlightPromoter', () => {
    const defaults = {
        onSelectionChange: jest.fn(),
        pageEl: document.createElement('div'),
    };
    const isSelecting: { current: unknown } = { current: false };
    const setIsSelecting = jest.fn((value: unknown) => {
        isSelecting.current = value;
    });
    const getWrapper = (props = {}): ShallowWrapper => shallow(<HighlightPromoter {...defaults} {...props} />);
    let removeEventListeners: void | (() => void | undefined);

    beforeEach(() => {
        jest.spyOn(React, 'useEffect').mockImplementation(func => {
            removeEventListeners = func();
        });
        jest.spyOn(React, 'useState').mockImplementation(() => [isSelecting.current, setIsSelecting]);
        defaults.onSelectionChange = jest.fn();
    });

    afterEach(() => {
        setIsSelecting(false);
        if (removeEventListeners) {
            removeEventListeners();
        }
    });

    describe('event handlers', () => {
        test('should add event listeners', () => {
            jest.spyOn(document, 'addEventListener');
            jest.spyOn(defaults.pageEl, 'addEventListener');

            getWrapper();

            expect(document.addEventListener).toHaveBeenCalledWith('selectionchange', expect.any(Function));
            expect(document.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
            expect(defaults.pageEl.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
        });

        test('should do nothing if onSelectionChange is undefined', () => {
            getWrapper({ onSelectionChange: undefined });

            defaults.pageEl.dispatchEvent(new MouseEvent('mousedown', { buttons: 1 }));
            document.dispatchEvent(new MouseEvent('mouseup'));
            document.dispatchEvent(new Event('selectionchange'));

            jest.runAllTimers();

            expect(defaults.onSelectionChange).not.toHaveBeenCalled();
            expect(setIsSelecting).not.toHaveBeenCalled();
        });

        test('should call set isSelecting true when mousedown', () => {
            getWrapper();

            defaults.pageEl.dispatchEvent(new MouseEvent('mousedown', { buttons: 1 }));

            expect(setIsSelecting).toHaveBeenCalledWith(true);
        });

        test('should call onSelectionChange when mouseup', () => {
            setIsSelecting(true);
            getWrapper();

            document.dispatchEvent(new MouseEvent('mouseup'));

            jest.runAllTimers();

            expect(defaults.onSelectionChange).toHaveBeenCalled();
            expect(setIsSelecting).toHaveBeenCalledWith(false);
        });

        test.each`
            selection                 | calledTimes
            ${null}                   | ${1}
            ${{ isCollapsed: true }}  | ${1}
            ${{ isCollapsed: false }} | ${0}
        `('should call onSelectionChange $calledTimes times when selectionchange', ({ selection, calledTimes }) => {
            getWrapper();

            jest.spyOn(document, 'getSelection').mockImplementation(() => selection);

            document.dispatchEvent(new Event('selectionchange'));
            expect(defaults.onSelectionChange).toHaveBeenCalledTimes(calledTimes);
        });
    });
});
