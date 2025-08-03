import ReactDOM from 'react-dom/client';
import DeselectManager from '../DeselectManager';
import { createStore } from '../../store';
import { Options } from '../BaseManager';

jest.mock('react-dom/client', () => ({
    createRoot: jest.fn().mockReturnValue({
        render: jest.fn(),
        unmount: jest.fn(),
    }),
}));

describe('DeselectManager', () => {
    const rootEl = document.createElement('div');
    const getOptions = (options: Partial<Options> = {}): Options => ({
        location: 1,
        referenceEl: rootEl.querySelector('.reference') as HTMLElement,
        ...options,
    });
    const getWrapper = (options?: Partial<Options>): DeselectManager => new DeselectManager(getOptions(options));

    beforeEach(() => {
        rootEl.classList.add('root');
        rootEl.innerHTML = '<div class="reference" />'; // referenceEl
    });

    describe('decorate()', () => {
        test('should add class and testid', () => {
            const wrapper = getWrapper();
            wrapper.decorate();

            expect(wrapper.reactEl.classList.contains('ba-Layer--deselect')).toBe(true);
            expect(wrapper.reactEl.dataset.testid).toEqual('ba-Layer--deselect');
        });
    });

    describe('render()', () => {
        test('should format the props and pass them to the underlying components', () => {
            const wrapper = getWrapper();
            const root = ReactDOM.createRoot(rootEl);
            wrapper.render({ store: createStore() });

            expect(root.render).toHaveBeenCalled();
        });
    });
});
