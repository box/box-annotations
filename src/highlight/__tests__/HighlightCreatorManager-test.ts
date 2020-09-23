import createStore from '../../store/__mocks__/createStore';
import { AppStore, setIsSelectingAction, setSelectionAction, getIsSelecting } from '../../store';
import { HighlightCreatorManager } from '..';
import { mockContainerRect, mockRange } from '../../store/highlight/__mocks__/data';
import { Options } from '../HighlightCreatorManager';

jest.mock('../../store');

jest.useFakeTimers();

describe('HighlightCreatorManager', () => {
    const defaults = {
        getSelection: jest.fn(() => ({
            canCreate: true,
            containerRect: mockContainerRect,
            location: 1,
            range: mockRange,
        })),
        store: (createStore() as unknown) as AppStore,
    };
    const rootEl = document.createElement('div');
    const getOptions = (options: Partial<Options> = {}): Options => ({
        ...defaults,
        referenceEl: rootEl.querySelector('.reference') as HTMLElement,
        ...options,
    });
    const getLayer = (): HTMLElement => rootEl.querySelector('.reference') as HTMLElement;
    const getWrapper = (options?: Partial<Options>): HighlightCreatorManager =>
        new HighlightCreatorManager(getOptions(options));

    const mockReferenceEl = document.createElement('div');

    beforeEach(() => {
        rootEl.classList.add('root');
        rootEl.innerHTML = '<div class="reference" />'; // referenceEl
    });

    describe('constructor()', () => {
        test('should set all necessary properties', () => {
            const wrapper = getWrapper();

            expect(wrapper.referenceEl).toEqual(getLayer());
        });
    });

    describe('destroy()', () => {
        test('should clear timeout and remove event handlers', () => {
            const wrapper = getWrapper();

            wrapper.referenceEl = mockReferenceEl;
            wrapper.selectionChangeTimer = 1;

            jest.spyOn(mockReferenceEl, 'removeEventListener');

            wrapper.destroy();

            expect(clearTimeout).toHaveBeenCalledWith(1);
            expect(mockReferenceEl.removeEventListener).toHaveBeenCalledWith('mousedown', wrapper.handleMouseDown);
            expect(mockReferenceEl.removeEventListener).toHaveBeenCalledWith('mouseup', wrapper.handleMouseUp);
        });
    });

    describe('exists()', () => {
        test('should return a boolean based on its presence in the page element', () => {
            const wrapper = getWrapper();

            expect(wrapper.exists(rootEl)).toBe(true);
            expect(wrapper.exists(document.createElement('div'))).toBe(false);
        });
    });

    describe('render()', () => {
        test('should clear previous selection and add listeners', () => {
            const wrapper = getWrapper();

            wrapper.referenceEl = mockReferenceEl;

            jest.spyOn(mockReferenceEl, 'addEventListener');

            wrapper.render();

            expect(defaults.store.dispatch).toHaveBeenCalled();
            expect(mockReferenceEl.addEventListener).toHaveBeenCalledWith('mousedown', wrapper.handleMouseDown);
            expect(mockReferenceEl.addEventListener).toHaveBeenCalledWith('mouseup', wrapper.handleMouseUp);
        });
    });

    describe('handleMouseDown()', () => {
        test('should clear timeout and selection', () => {
            const wrapper = getWrapper();

            wrapper.selectionChangeTimer = 1;
            ((setIsSelectingAction as unknown) as jest.Mock).mockReturnValue({ type: 'set_is_selecting' });
            ((setSelectionAction as unknown) as jest.Mock).mockReturnValue({ type: 'set_selection' });

            wrapper.handleMouseDown(new MouseEvent('mousedown', { buttons: 1 }));

            expect(clearTimeout).toHaveBeenCalledWith(1);
            expect(setIsSelectingAction).toHaveBeenCalledWith(true);
            expect(defaults.store.dispatch).toHaveBeenCalledWith({ type: 'set_is_selecting' });
            expect(setSelectionAction).toHaveBeenCalledWith(null);
            expect(defaults.store.dispatch).toHaveBeenCalledWith({ type: 'set_selection' });
        });

        test('should do nothing if is not primary button', () => {
            const wrapper = getWrapper();

            wrapper.handleMouseDown(new MouseEvent('mousedown', { buttons: 2 }));

            expect(defaults.store.dispatch).not.toHaveBeenCalled();
        });
    });

    describe('handleMouseUp()', () => {
        test('should set selection', () => {
            const wrapper = getWrapper();

            (getIsSelecting as jest.Mock).mockReturnValue(true);

            wrapper.handleMouseUp();

            expect(defaults.store.dispatch).not.toHaveBeenCalled();

            jest.runAllTimers();

            expect(defaults.getSelection).toHaveBeenCalled();
            expect(setSelectionAction).toHaveBeenCalled();
            expect(setIsSelectingAction).toHaveBeenCalledWith(false);
            expect(defaults.store.dispatch).toHaveBeenCalledTimes(2);
        });

        test('should do nothing if select not using mouse', () => {
            const wrapper = getWrapper();

            (getIsSelecting as jest.Mock).mockReturnValue(false);

            wrapper.handleMouseUp();

            expect(window.setTimeout).not.toHaveBeenCalled();
        });
    });
});
