import createStore from '../../store/__mocks__/createStore';
import HighlightListener from '../HighlightListener';
import { AppStore, getIsInitialized, setIsSelectingAction, setSelectionAction, getIsSelecting } from '../../store';
import { mockContainerRect, mockRange } from '../../store/highlight/__mocks__/data';

jest.mock('lodash/debounce', () => (func: Function) => func);
jest.mock('../../store', () => ({
    getIsInitialized: jest.fn().mockReturnValue(false),
    getIsSelecting: jest.fn().mockReturnValue(false),
    setIsSelectingAction: jest.fn(arg => arg),
    setSelectionAction: jest.fn(arg => arg),
}));

jest.useFakeTimers();

describe('HighlightListener', () => {
    const defaults = {
        getSelection: jest.fn(() => ({ containerRect: mockContainerRect, location: 1, range: mockRange })),
        store: (createStore() as unknown) as AppStore,
    };
    const mockAnnotatedEl = document.createElement('div');

    const getListener = (options = {}): HighlightListener => {
        return new HighlightListener({ ...defaults, ...options });
    };

    let highlightListener: HighlightListener;

    beforeEach(() => {
        highlightListener = getListener();
    });

    afterEach(() => {
        if (highlightListener) {
            highlightListener.destroy();
        }
    });

    describe('constructor()', () => {
        test('should add selectionchange event listener', () => {
            jest.spyOn(document, 'addEventListener');

            highlightListener = getListener();

            expect(document.addEventListener).toHaveBeenCalledWith(
                'selectionchange',
                highlightListener.handleSelectionChange,
            );
        });
    });

    describe('destroy()', () => {
        test('should clear timeout and remove event handlers', () => {
            highlightListener.annotatedEl = mockAnnotatedEl;
            highlightListener.selectionChangeTimer = 1;
            jest.spyOn(document, 'removeEventListener');
            jest.spyOn(mockAnnotatedEl, 'removeEventListener');

            highlightListener.destroy();

            expect(clearTimeout).toHaveBeenCalledWith(1);
            expect(document.removeEventListener).toHaveBeenCalledWith(
                'selectionchange',
                highlightListener.handleSelectionChange,
            );
            expect(mockAnnotatedEl.removeEventListener).toHaveBeenCalledWith(
                'mousedown',
                highlightListener.handleMouseDown,
            );
            expect(mockAnnotatedEl.removeEventListener).toHaveBeenCalledWith(
                'mouseup',
                highlightListener.handleMouseUp,
            );
        });
    });

    describe('init()', () => {
        test('should clear previous selection and add listeners', () => {
            jest.spyOn(mockAnnotatedEl, 'addEventListener');

            highlightListener.init(mockAnnotatedEl);

            expect(defaults.store.dispatch).toHaveBeenCalledWith(null);
            expect(mockAnnotatedEl.addEventListener).toHaveBeenCalledWith(
                'mousedown',
                highlightListener.handleMouseDown,
            );
            expect(mockAnnotatedEl.addEventListener).toHaveBeenCalledWith('mouseup', highlightListener.handleMouseUp);
        });

        test('should not add listeners if already initialized', () => {
            jest.spyOn(mockAnnotatedEl, 'addEventListener');

            (getIsInitialized as jest.Mock).mockReturnValueOnce(true);

            highlightListener.init(mockAnnotatedEl);

            expect(mockAnnotatedEl.addEventListener).not.toHaveBeenCalled();
        });
    });

    describe('setSelection()', () => {
        test('should dispatch selection', () => {
            highlightListener.setSelection();

            expect(defaults.store.dispatch).toHaveBeenCalledWith({
                containerRect: mockContainerRect,
                location: 1,
                range: mockRange,
            });
        });
    });

    describe('handleMouseDown()', () => {
        test('should clear timeout and selection', () => {
            highlightListener.selectionChangeTimer = 1;

            highlightListener.handleMouseDown(new MouseEvent('mousedown', { buttons: 1 }));

            expect(setIsSelectingAction).toHaveBeenCalled();
            expect(defaults.store.dispatch).toHaveBeenCalledWith(true);
            expect(clearTimeout).toHaveBeenCalledWith(1);
            expect(setSelectionAction).toHaveBeenCalledWith(null);
            expect(defaults.store.dispatch).toHaveBeenCalledWith(null);
        });

        test('should do nothing if is not primary button', () => {
            highlightListener.handleMouseDown(new MouseEvent('mousedown', { buttons: 2 }));

            expect(defaults.store.dispatch).not.toHaveBeenCalled();
        });
    });

    describe('handleMouseUp()', () => {
        test('should set selection', () => {
            (getIsSelecting as jest.Mock).mockReturnValue(true);
            highlightListener.setSelection = jest.fn();

            highlightListener.handleMouseUp();

            expect(highlightListener.setSelection).not.toHaveBeenCalled();

            jest.runAllTimers();

            expect(highlightListener.setSelection).toHaveBeenCalled();
            expect(setIsSelectingAction).toHaveBeenCalledWith(false);
            expect(defaults.store.dispatch).toHaveBeenCalledWith(false);
        });

        test('should do nothing if select not using mouse', () => {
            (getIsSelecting as jest.Mock).mockReturnValue(false);
            highlightListener.handleMouseUp();

            expect(window.setTimeout).not.toHaveBeenCalled();
        });
    });

    describe('handleSelectionChange()', () => {
        test('should clear selection and dispatch new selection', () => {
            highlightListener.setSelection = jest.fn();

            highlightListener.handleSelectionChange();

            expect(highlightListener.setSelection).toHaveBeenCalled();
        });

        test('should do nothing if select using mouse', () => {
            (getIsSelecting as jest.Mock).mockReturnValue(true);
            highlightListener.setSelection = jest.fn();

            highlightListener.handleSelectionChange();

            expect(highlightListener.setSelection).not.toHaveBeenCalled();
        });
    });
});
