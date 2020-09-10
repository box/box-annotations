import createStore from '../../store/__mocks__/createStore';
import HighlightListener from '../HighlightListener';
import { AppStore, setSelectionAction, getIsSelecting } from '../../store';
import { mockContainerRect, mockRange } from '../../store/highlight/__mocks__/data';

jest.mock('lodash/debounce', () => (func: Function) => func);
jest.mock('../../store');

jest.useFakeTimers();

describe('HighlightListener', () => {
    const defaults = {
        getSelection: jest.fn(() => ({ containerRect: mockContainerRect, location: 1, range: mockRange })),
        store: (createStore() as unknown) as AppStore,
    };

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
            jest.spyOn(document, 'removeEventListener');

            highlightListener.destroy();

            expect(document.removeEventListener).toHaveBeenCalledWith(
                'selectionchange',
                highlightListener.handleSelectionChange,
            );
        });
    });

    describe('handleSelectionChange()', () => {
        test('should clear selection and dispatch new selection', () => {
            highlightListener.handleSelectionChange();

            expect(defaults.getSelection).toHaveBeenCalled();
            expect(setSelectionAction).toHaveBeenCalled();
            expect(defaults.store.dispatch).toHaveBeenCalled();
        });

        test('should do nothing if select using mouse', () => {
            (getIsSelecting as jest.Mock).mockReturnValue(true);

            highlightListener.handleSelectionChange();

            expect(defaults.store.dispatch).not.toHaveBeenCalled();
        });
    });
});
